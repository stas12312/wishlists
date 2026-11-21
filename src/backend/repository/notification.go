package repository

import (
	"main/model"
	"time"
)

type NotificationPreferenceRow struct {
	Kind string `db:"kind"`
	model.NotificationPreference
}

type NotificationRepository interface {
	Create(model.Notification) error
	List(userId, before int64, limit int) ([]model.Notification, error)
	CountUnread(userId int64) (int, error)
	MarkAllRead(userId int64) (bool, error)
	MarkReadByIds(userId int64, ids []int64) (bool, error)
	MarkRead(userId int64, kind, resourceKey string, eventKeys []string) (bool, error)
	Preferences(userId int64, kinds []string) ([]NotificationPreferenceRow, error)
	SetPreference(userId int64, kind, channel string, enabled bool) error
	ClaimDelivery(channel string) (model.NotificationDelivery, error)
	CompleteDelivery(delivery model.NotificationDelivery, status, lastError string, delay time.Duration) error
	DeliveryAddress(delivery model.NotificationDelivery) (string, error)
}
