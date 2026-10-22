package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type Conversation struct {
	Id        int64     `json:"id" db:"conversation_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type Message struct {
	Id             int64       `json:"id" db:"message_id"`
	ConversationId int64       `json:"conversation_id" db:"conversation_id"`
	Content        string      `json:"content" db:"content"`
	SenderId       int64       `json:"sender_id" db:"sender_id"`
	CreatedAt      time.Time   `json:"created_at" db:"created_at"`
	Attachments    Attachments `json:"attachments" db:"attachments"`
}

type Attachment struct {
	Url  string `json:"url"`
	Name string `json:"name"`
	Size int64  `json:"size"`
}

type Attachments []Attachment

func (a Attachments) Value() (driver.Value, error) {
	if a == nil {
		return []byte("[]"), nil
	}
	return json.Marshal(a)
}

func (a *Attachments) Scan(src interface{}) error {
	switch v := src.(type) {
	case []byte:
		return json.Unmarshal(v, a)
	case string:
		return json.Unmarshal([]byte(v), a)
	}
	return errors.New("type assertion failed")
}
