package model

import "time"

type AdminNotificationFilter struct {
	RecipientID int64
	Search      string
	Kind        string
	Channel     string
	Status      string
	PushSends   bool
	Since       *time.Time
	Before      *time.Time
	BeforeID    int64
}

type AdminNotification struct {
	ID              int64      `json:"id" db:"notification_id"`
	RecipientID     int64      `json:"recipient_id" db:"recipient_id"`
	RecipientName   string     `json:"recipient_name" db:"recipient_name"`
	Username        string     `json:"username" db:"username"`
	Kind            string     `json:"kind" db:"kind"`
	Title           string     `json:"title" db:"-"`
	EntityTitle     *string    `json:"entity_title" db:"entity_title"`
	CreatedAt       time.Time  `json:"created_at" db:"created_at"`
	ReadAt          *time.Time `json:"read_at" db:"read_at"`
	EmailStatus     *string    `json:"email_status" db:"email_status"`
	TelegramStatus  *string    `json:"telegram_status" db:"telegram_status"`
	PushStatus      *string    `json:"push_status" db:"push_status"`
	PushSendID      int64      `json:"push_send_id,omitempty" db:"push_send_id"`
	PushAttemptedAt *time.Time `json:"push_attempted_at,omitempty" db:"push_attempted_at"`
	PushProvider    string     `json:"push_provider,omitempty" db:"push_provider"`
	PushDevice      string     `json:"push_device,omitempty" db:"push_device"`
	PushSendError   *string    `json:"push_send_error,omitempty" db:"push_send_error"`
}

type AdminNotificationDetail struct {
	AdminNotification
	ResourceKey      string          `json:"resource_key" db:"resource_key"`
	Body             string          `json:"body" db:"body"`
	EmailAttempts    *int            `json:"email_attempts" db:"email_attempts"`
	EmailError       *string         `json:"email_error" db:"email_error"`
	TelegramAttempts *int            `json:"telegram_attempts" db:"telegram_attempts"`
	TelegramError    *string         `json:"telegram_error" db:"telegram_error"`
	PushAttempts     *int            `json:"push_attempts" db:"push_attempts"`
	PushError        *string         `json:"push_error" db:"push_error"`
	PushSends        []AdminPushSend `json:"push_sends" db:"-"`
}

type AdminPushSend struct {
	Error       *string   `json:"error" db:"last_error"`
	ID          int64     `json:"id" db:"push_send_id"`
	AttemptedAt time.Time `json:"attempted_at" db:"attempted_at"`
	Provider    string    `json:"provider" db:"provider"`
	Device      string    `json:"device" db:"device"`
}
