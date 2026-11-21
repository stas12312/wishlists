package model

import "time"

const (
	NotificationSupportReply     = "support.reply"
	NotificationQuestionCreated  = "question.created"
	NotificationQuestionAnswered = "question.answered"
	NotificationEmail            = "email"
	NotificationTelegram         = "telegram"
)

type Notification struct {
	Id          int64      `json:"id" db:"notification_id"`
	RecipientId int64      `json:"-" db:"recipient_id"`
	Kind        string     `json:"kind" db:"kind"`
	EventKey    string     `json:"-" db:"event_key"`
	ResourceKey string     `json:"-" db:"resource_key"`
	Body        string     `json:"body" db:"body"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	ReadAt      *time.Time `json:"read_at" db:"read_at"`
}

type NotificationItem struct {
	Notification
	Title string `json:"title"`
	Href  string `json:"href"`
}

type NotificationDelivery struct {
	Notification
	Channel  string `db:"channel"`
	Attempts int    `db:"attempts"`
}

type NotificationPreference struct {
	Channel   string `json:"channel" db:"channel"`
	Enabled   bool   `json:"enabled" db:"enabled"`
	Available bool   `json:"available" db:"available"`
	Linked    bool   `json:"linked,omitempty" db:"linked"`
}
