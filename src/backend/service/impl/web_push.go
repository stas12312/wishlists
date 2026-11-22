package impl

import (
	"context"
	"crypto/ecdh"
	"crypto/hmac"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"main/model"
	"net/http"
	"net/mail"
	"net/url"
	"strconv"
	"strings"
	"time"

	webpush "github.com/SherClockHolmes/webpush-go"
	"github.com/gofiber/fiber/v2/log"
)

type pushSender struct {
	options webpush.Options
}

type pushDeliveryError struct {
	status    int
	permanent bool
}

func (e *pushDeliveryError) Error() string {
	return fmt.Sprintf("Push-сервис отклонил отправку (%d)", e.status)
}

func (s *NotificationService) ConfigurePush(publicKey, privateKey, contact string) bool {
	if publicKey == "" && privateKey == "" && contact == "" {
		return false
	}
	privateBytes, err := base64.RawURLEncoding.DecodeString(privateKey)
	if err != nil {
		log.Warn("Канал Web Push отключён: неверный формат приватного ключа VAPID")
		return false
	}
	key, err := ecdh.P256().NewPrivateKey(privateBytes)
	address, addressErr := mail.ParseAddress(contact)
	if err != nil || !hmac.Equal([]byte(publicKey), []byte(base64.RawURLEncoding.EncodeToString(key.PublicKey().Bytes()))) ||
		addressErr != nil || address.Address != contact {
		log.Warn("Канал Web Push отключён: проверьте ключи VAPID и контактный email")
		return false
	}
	s.push = &pushSender{options: webpush.Options{
		Subscriber: contact, VAPIDPublicKey: publicKey, VAPIDPrivateKey: privateKey,
		TTL: 3600,
		HTTPClient: &http.Client{
			Timeout:       8 * time.Second,
			CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse },
		},
	}}
	return true
}

func (s *NotificationService) PushPublicKey() string {
	if s.push == nil {
		return ""
	}
	return s.push.options.VAPIDPublicKey
}

var ErrInvalidPushSubscription = errors.New("некорректная подписка Web Push")

func validPushEndpoint(endpoint string) bool {
	if len(endpoint) > 2000 {
		return false
	}
	target, err := url.Parse(endpoint)
	if err != nil || target.Scheme != "https" || target.User != nil ||
		target.Port() != "" || target.Fragment != "" || target.Path == "" || target.Path == "/" {
		return false
	}
	host := target.Hostname()
	return host == "fcm.googleapis.com" ||
		host == "push.services.mozilla.com" || strings.HasSuffix(host, ".push.services.mozilla.com") ||
		strings.HasSuffix(host, ".push.apple.com") || strings.HasSuffix(host, ".notify.windows.com")
}

func (s *NotificationService) SavePushSubscription(userId int64, sub model.PushSubscription) (bool, error) {
	if !validPushEndpoint(sub.Endpoint) || len(sub.Auth) != 22 || len(sub.P256dh) != 87 {
		return false, ErrInvalidPushSubscription
	}
	auth, authErr := base64.RawURLEncoding.DecodeString(sub.Auth)
	publicBytes, decodeErr := base64.RawURLEncoding.DecodeString(sub.P256dh)
	_, keyErr := ecdh.P256().NewPublicKey(publicBytes)
	if authErr != nil || len(auth) != 16 || decodeErr != nil || keyErr != nil {
		return false, ErrInvalidPushSubscription
	}
	return s.repository.SavePushSubscription(userId, sub)
}

func (s *NotificationService) HasPushSubscription(userId int64, endpoint string) (bool, error) {
	if !validPushEndpoint(endpoint) {
		return false, ErrInvalidPushSubscription
	}
	return s.repository.HasPushSubscription(userId, endpoint)
}

func (s *NotificationService) DeletePushSubscription(userId int64, endpoint string) error {
	if !validPushEndpoint(endpoint) {
		return ErrInvalidPushSubscription
	}
	return s.repository.DeletePushSubscription(userId, endpoint)
}

func (s *NotificationService) sendPush(ctx context.Context, delivery model.NotificationDelivery, item model.NotificationItem) error {
	subscriptions, err := s.repository.PushDeliverySubscriptions(delivery)
	if err != nil {
		return err
	}
	notificationId := strconv.FormatInt(item.Id, 10)
	payload, err := json.Marshal(map[string]string{
		"title": item.Title, "href": item.Href, "id": notificationId, "body": pushPreview(item),
	})
	if err != nil {
		return err
	}
	options := s.push.options
	options.Topic = notificationId
	ctx, cancel := context.WithTimeout(ctx, 90*time.Second)
	defer cancel()

	var retryable, rejected error
	sent := false
	for _, sub := range subscriptions {
		if !validPushEndpoint(sub.Endpoint) {
			continue
		}
		target, _ := url.Parse(sub.Endpoint)
		response, sendErr := webpush.SendNotificationWithContext(ctx, payload, &webpush.Subscription{
			Endpoint: sub.Endpoint, Keys: webpush.Keys{Auth: sub.Auth, P256dh: sub.P256dh},
		}, &options)
		status, reason, canRetry := 0, "", false
		if sendErr != nil {
			reason, canRetry = "Не удалось отправить запрос в push-сервис", true
		} else {
			response.Body.Close()
			status = response.StatusCode
			if status < 200 || status >= 300 {
				canRetry = status == http.StatusTooManyRequests || status >= 500
				sendErr = &pushDeliveryError{status: status, permanent: !canRetry}
				reason = sendErr.Error()
			}
		}
		if err := s.repository.RecordPushSend(delivery.Id, sub.Key, target.Hostname(), reason, canRetry && delivery.Attempts < 5); err != nil {
			retryable = err
			continue
		}
		switch {
		case sendErr == nil:
			sent = true
		case status == http.StatusNotFound || status == http.StatusGone:
			if err := s.DeletePushSubscription(delivery.RecipientId, sub.Endpoint); err != nil {
				retryable = err
			}
		case canRetry:
			retryable = sendErr
		default:
			rejected = sendErr
		}
	}
	switch {
	case retryable != nil:
		return retryable
	case sent:
		return nil
	}
	previouslySent, err := s.repository.HasPushSends(delivery.Id)
	if err != nil || previouslySent {
		return err
	}
	if rejected != nil {
		return rejected
	}
	return sql.ErrNoRows
}

func pushPreview(item model.NotificationItem) string {
	preview := make([]string, 0, 2)
	if item.EntityTitle != nil {
		if title := truncatePushText(*item.EntityTitle, 120); title != "" {
			preview = append(preview, title)
		}
	}
	if body := truncatePushText(item.Body, 240); body != "" {
		preview = append(preview, body)
	}
	return strings.Join(preview, "\n")
}

func truncatePushText(text string, maxRunes int) string {
	runes := []rune(strings.Join(strings.Fields(text), " "))
	if len(runes) <= maxRunes {
		return string(runes)
	}
	return string(runes[:maxRunes-1]) + "…"
}
