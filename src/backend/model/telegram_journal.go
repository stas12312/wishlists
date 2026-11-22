package model

import "time"

type TelegramChat struct {
	ChatID   string  `db:"chat_id" json:"chat_id"`
	UserID   *string `db:"user_id" json:"user_id"`
	Username *string `db:"username" json:"username"`
}

type TelegramMessage struct {
	ID        string    `db:"id" json:"id"`
	MessageID string    `db:"message_id" json:"message_id"`
	Direction string    `db:"direction" json:"direction"`
	Kind      string    `db:"kind" json:"kind"`
	Text      string    `db:"text" json:"text"`
	SentAt    time.Time `db:"sent_at" json:"sent_at"`
}
