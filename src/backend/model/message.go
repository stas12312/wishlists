package model

import "time"

type Conversation struct {
	Id        int64     `json:"id" db:"conversation_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type Message struct {
	Id             int64     `json:"id" db:"message_id"`
	ConversationId int64     `json:"conversation_id" db:"conversation_id"`
	Content        string    `json:"content" db:"content"`
	SenderId       int64     `json:"sender_id" db:"sender_id"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
}
