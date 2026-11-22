package model

import "time"

type AdminNotificationFilter struct {
	RecipientID int64
	Search      string
	Kind        string
	Channel     string
	Status      string
	Since       *time.Time
	Before      *time.Time
	BeforeID    int64
}

type AdminNotification struct {
	ID             int64      `json:"id" db:"notification_id"`
	RecipientID    int64      `json:"recipient_id" db:"recipient_id"`
	RecipientName  string     `json:"recipient_name" db:"recipient_name"`
	Username       string     `json:"username" db:"username"`
	Kind           string     `json:"kind" db:"kind"`
	Title          string     `json:"title" db:"-"`
	EntityTitle    *string    `json:"entity_title" db:"entity_title"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
	ReadAt         *time.Time `json:"read_at" db:"read_at"`
	EmailStatus    *string    `json:"email_status" db:"email_status"`
	TelegramStatus *string    `json:"telegram_status" db:"telegram_status"`
}

type AdminNotificationDetail struct {
	AdminNotification
	ResourceKey      string  `json:"resource_key" db:"resource_key"`
	Body             string  `json:"body" db:"body"`
	EmailAttempts    *int    `json:"email_attempts" db:"email_attempts"`
	EmailError       *string `json:"email_error" db:"email_error"`
	TelegramAttempts *int    `json:"telegram_attempts" db:"telegram_attempts"`
	TelegramError    *string `json:"telegram_error" db:"telegram_error"`
}
