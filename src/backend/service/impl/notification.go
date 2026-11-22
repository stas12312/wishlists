package impl

import (
	"context"
	"database/sql"
	"errors"
	"main/mail"
	"main/model"
	"main/repository"
	"main/service"
	"main/telegram"
	"net/http"
	"net/textproto"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2/log"
)

type telegramNotificationSender interface {
	SendNotification(ctx context.Context, chatID int64, title, entityTitle, body, miniAppURL, siteURL string) error
}

type NotificationService struct {
	repository repository.NotificationRepository
	ws         service.WSService
	mail       mail.MailClient
	baseURL    string
	telegram   telegramNotificationSender
	botURL     string
	push       *pushSender
}

func NewNotificationService(repo repository.NotificationRepository, ws service.WSService, mailClient mail.MailClient, baseURL string, bot telegramNotificationSender, botUsername string) *NotificationService {
	return &NotificationService{
		repository: repo, ws: ws, mail: mailClient, baseURL: strings.TrimRight(baseURL, "/"),
		telegram: bot, botURL: telegramAuthDeepLink(botUsername),
	}
}

func supportReplyNotification(ticket *model.Ticket, message *model.Message) model.Notification {
	body := message.Content
	if body == "" && len(message.Attachments) > 0 {
		body = "К ответу прикреплены файлы"
	}
	return model.Notification{
		RecipientId: ticket.AuthorId,
		Kind:        model.NotificationSupportReply,
		EventKey:    strconv.FormatInt(message.Id, 10),
		ResourceKey: strconv.FormatInt(ticket.Id, 10),
		EntityTitle: &ticket.Subject,
		Body:        body,
	}
}

var notificationTemplates = map[string]struct {
	title      string
	href       string
	hrefPrefix string
	emoji      string
}{
	model.NotificationSupportReply: {
		title:      "Получен ответ от поддержки",
		hrefPrefix: "/tickets/",
		emoji:      "💬",
	},
	model.NotificationQuestionCreated: {
		title:      "Вам задали вопрос о желании",
		hrefPrefix: "/questions/",
		emoji:      "❓",
	},
	model.NotificationQuestionAnswered: {
		title:      "На ваш вопрос ответили",
		hrefPrefix: "/questions/",
		emoji:      "💬",
	},
	model.NotificationFriendRequested: {
		title: "Новая заявка в друзья",
		href:  "/friends?tab=requests",
		emoji: "👋",
	},
	model.NotificationFriendAccepted: {
		title: "Вашу заявку в друзья приняли",
		href:  "/friends?tab=requests",
		emoji: "🤝",
	},
	model.NotificationFriendDeclined: {
		title: "Вашу заявку в друзья отклонили",
		href:  "/friends?tab=requests",
		emoji: "👤",
	},
}

func (s *NotificationService) SupportsKind(kind string) bool {
	_, ok := notificationTemplates[kind]
	return ok
}

func notificationItem(n model.Notification) model.NotificationItem {
	item := model.NotificationItem{Notification: n}
	if template, ok := notificationTemplates[n.Kind]; ok {
		item.Title = template.title
		item.Href = template.href
		if template.hrefPrefix != "" {
			item.Href = template.hrefPrefix + n.ResourceKey
		}
	}
	return item
}

func (s *NotificationService) List(userId, before int64) ([]model.NotificationItem, int64, error) {
	const pageSize = 20
	notifications, err := s.repository.List(userId, before, pageSize+1)
	if err != nil {
		return nil, 0, err
	}
	var next int64
	if len(notifications) > pageSize {
		notifications = notifications[:pageSize]
		next = notifications[pageSize-1].Id
	}
	items := make([]model.NotificationItem, 0, len(notifications))
	for _, notification := range notifications {
		items = append(items, notificationItem(notification))
	}
	return items, next, nil
}

func (s *NotificationService) CountUnread(userId int64) (int, error) {
	return s.repository.CountUnread(userId)
}

func (s *NotificationService) MarkAllRead(userId int64) error {
	changed, err := s.repository.MarkAllRead(userId)
	if changed {
		s.ws.SendMessage(userId, model.WSMessage{Event: service.NotificationsChanged})
	}
	return err
}

func (s *NotificationService) MarkVisibleRead(userId int64, ids []int64) error {
	changed, err := s.repository.MarkReadByIds(userId, ids)
	if changed {
		s.ws.SendMessage(userId, model.WSMessage{Event: service.NotificationsChanged})
	}
	return err
}

func (s *NotificationService) MarkEventsRead(userId int64, kind, resourceKey string, eventKeys []string) error {
	changed, err := s.repository.MarkRead(userId, kind, resourceKey, eventKeys)
	if changed {
		s.ws.SendMessage(userId, model.WSMessage{Event: service.NotificationsChanged})
	}
	return err
}

func (s *NotificationService) Preferences(userId int64, kinds ...string) (map[string][]model.NotificationPreference, error) {
	if len(kinds) == 0 {
		for kind := range notificationTemplates {
			kinds = append(kinds, kind)
		}
	}
	rows, err := s.repository.Preferences(userId, kinds)
	if err != nil {
		return nil, err
	}
	preferences := make(map[string][]model.NotificationPreference, len(kinds))
	for _, kind := range kinds {
		preferences[kind] = []model.NotificationPreference{}
	}
	for _, row := range rows {
		preference := row.NotificationPreference
		if preference.Channel == model.NotificationTelegram {
			preference.Available = preference.Available && s.botURL != ""
		}
		if preference.Channel == model.NotificationWebPush && s.push == nil {
			continue
		}
		preferences[row.Kind] = append(preferences[row.Kind], preference)
	}
	return preferences, nil
}

func (s *NotificationService) SetPreference(userId int64, kind, channel string, enabled bool) error {
	if channel == model.NotificationWebPush && s.push == nil {
		return sql.ErrNoRows
	}
	if enabled && channel == model.NotificationTelegram && s.botURL == "" {
		return sql.ErrNoRows
	}
	if kind == model.NotificationFriendPreference {
		return s.repository.SetPreference(userId, channel, enabled,
			model.NotificationFriendRequested, model.NotificationFriendAccepted, model.NotificationFriendDeclined)
	}
	if kind == model.NotificationQuestionPreference {
		return s.repository.SetPreference(userId, channel, enabled,
			model.NotificationQuestionCreated, model.NotificationQuestionAnswered)
	}
	return s.repository.SetPreference(userId, channel, enabled, kind)
}

func (s *NotificationService) Run(ctx context.Context, channel string) {
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()
	for ctx.Err() == nil {
		delivery, err := s.repository.ClaimDelivery(channel)
		if err == nil {
			s.deliver(ctx, delivery)
			continue
		}
		if !errors.Is(err, sql.ErrNoRows) {
			log.Errorf("Не удалось получить задание доставки уведомления: %v", err)
		}
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}

func (s *NotificationService) deliver(ctx context.Context, delivery model.NotificationDelivery) {
	var address string
	var err error
	if delivery.Channel != model.NotificationWebPush {
		address, err = s.repository.DeliveryAddress(delivery)
	}
	item := notificationItem(delivery.Notification)
	status := "sent"
	lastError := ""
	var delay time.Duration
	switch {
	case errors.Is(err, sql.ErrNoRows), err == nil && address == "" && delivery.Channel != model.NotificationWebPush:
		status = "skipped"
	case err != nil:
		lastError = "Не удалось получить адрес доставки"
	case item.Href == "":
		status = "failed"
		lastError = "Неизвестный тип уведомления"
	default:
		switch delivery.Channel {
		case model.NotificationWebPush:
			err = s.sendPush(ctx, delivery, item)
			if errors.Is(err, sql.ErrNoRows) {
				status, err = "skipped", nil
			}
		case model.NotificationTelegram:
			err = s.sendTelegram(ctx, address, item)
		default:
			err = s.sendEmail(address, item)
		}
		if err != nil {
			lastError = "Провайдер не подтвердил отправку"
		}
	}
	if err != nil && status == "sent" {
		status = "failed"
		var smtpError *textproto.Error
		var telegramError *telegram.APIError
		permanent := false
		var retryAfter time.Duration
		if errors.As(err, &smtpError) {
			permanent = smtpError.Code >= 500 && smtpError.Code < 600
			lastError = "SMTP отклонил отправку (" + strconv.Itoa(smtpError.Code) + ")"
		}
		if errors.As(err, &telegramError) {
			permanent = telegramError.Code >= 400 && telegramError.Code < 500 && telegramError.Code != http.StatusTooManyRequests
			retryAfter = telegramError.RetryAfter
			lastError = telegramError.Error()
		}
		var pushError *pushDeliveryError
		if errors.As(err, &pushError) {
			permanent = pushError.permanent
			lastError = pushError.Error()
		}
		if delivery.Attempts < 5 && !permanent {
			status = "pending"
			delay = max(time.Minute<<(delivery.Attempts-1), retryAfter)
		}
	}
	if err := s.repository.CompleteDelivery(delivery, status, lastError, delay); err != nil {
		log.Errorf("Не удалось обновить доставку уведомления %d через %s: %v", delivery.Id, delivery.Channel, err)
	}
}

func (s *NotificationService) sendTelegram(ctx context.Context, address string, item model.NotificationItem) error {
	chatId, err := strconv.ParseInt(address, 10, 64)
	if err != nil {
		return err
	}
	title := item.Title
	if emoji := notificationTemplates[item.Kind].emoji; emoji != "" {
		title = emoji + " " + title
	}
	preview := []rune(item.Body)
	if len(preview) > 1000 {
		preview = append(preview[:1000], '…')
	}
	var entityTitle string
	if item.EntityTitle != nil {
		runes := []rune(*item.EntityTitle)
		if len(runes) > 500 {
			runes = append(runes[:500], '…')
		}
		entityTitle = string(runes)
	}
	miniAppURL := s.baseURL + "/miniapp/telegram?ret=" + url.QueryEscape(item.Href)
	return s.telegram.SendNotification(ctx, chatId, title, entityTitle, string(preview), miniAppURL, s.baseURL+item.Href)
}

func (s *NotificationService) sendEmail(address string, item model.NotificationItem) error {
	body, err := mail.RenderNotification(item.Title, item.EntityTitle, item.Body, s.baseURL+item.Href, s.baseURL+"/settings#notifications")
	if err != nil {
		return err
	}
	return s.mail.Send([]string{address}, item.Title, body)
}
