package impl

import (
	"context"
	"database/sql"
	"errors"
	"html"
	"main/mail"
	"main/model"
	"main/repository"
	"main/service"
	"net/textproto"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2/log"
)

type NotificationService struct {
	repository repository.NotificationRepository
	ws         service.WSService
	mail       mail.MailClient
	baseURL    string
}

func NewNotificationService(repo repository.NotificationRepository, ws service.WSService, mailClient mail.MailClient, baseURL string) *NotificationService {
	return &NotificationService{repo, ws, mailClient, strings.TrimRight(baseURL, "/")}
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
		Body:        body,
	}
}

var notificationTemplates = map[string]struct {
	title      string
	hrefPrefix string
}{
	model.NotificationSupportReply: {
		title:      "Получен ответ от поддержки",
		hrefPrefix: "/tickets/",
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
		item.Href = template.hrefPrefix + n.ResourceKey
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

func (s *NotificationService) Preferences(userId int64, kind string) ([]model.NotificationPreference, error) {
	return s.repository.Preferences(userId, kind)
}

func (s *NotificationService) SetPreference(userId int64, kind, channel string, enabled bool) error {
	return s.repository.SetPreference(userId, kind, channel, enabled)
}

func (s *NotificationService) Run(ctx context.Context, channel string) {
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()
	for ctx.Err() == nil {
		delivery, err := s.repository.ClaimDelivery(channel)
		if err == nil {
			s.deliver(delivery)
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

func (s *NotificationService) deliver(delivery model.NotificationDelivery) {
	address, err := s.repository.DeliveryAddress(delivery)
	item := notificationItem(delivery.Notification)
	status := "sent"
	lastError := ""
	var delay time.Duration
	switch {
	case errors.Is(err, sql.ErrNoRows), err == nil && address == "":
		status = "skipped"
	case err != nil:
		lastError = "Не удалось получить адрес доставки"
	case item.Href == "":
		status = "failed"
		lastError = "Неизвестный тип уведомления"
	default:
		err = s.sendEmail(address, item)
		if err != nil {
			lastError = "Провайдер не подтвердил отправку"
		}
	}
	if err != nil && status == "sent" {
		status = "failed"
		var smtpError *textproto.Error
		permanent := false
		if errors.As(err, &smtpError) {
			permanent = smtpError.Code >= 500 && smtpError.Code < 600
			lastError = "SMTP отклонил отправку (" + strconv.Itoa(smtpError.Code) + ")"
		}
		if delivery.Attempts < 5 && !permanent {
			status = "pending"
			delay = time.Minute << (delivery.Attempts - 1)
		}
	}
	if err := s.repository.CompleteDelivery(delivery, status, lastError, delay); err != nil {
		log.Errorf("Не удалось обновить доставку уведомления %d через %s: %v", delivery.Id, delivery.Channel, err)
	}
}

func (s *NotificationService) sendEmail(address string, item model.NotificationItem) error {
	link := s.baseURL + item.Href
	body := "<p>" + html.EscapeString(item.Title) + ".</p>"
	if item.Body != "" {
		message := strings.ReplaceAll(html.EscapeString(item.Body), "\n", "<br>")
		body += "<p>" + message + "</p>"
	}
	body += "<p><a href=\"" + html.EscapeString(link) + "\">Открыть в MyWishlists</a></p>"
	return s.mail.Send([]string{address}, item.Title, body)
}
