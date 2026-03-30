package impl

import (
	"main/db"
	"main/model"
)

func NewMessageRepositoryPostgres(conn db.Connection) *MessageRepositoryPostgres {
	return &MessageRepositoryPostgres{conn: conn}
}

type MessageRepositoryPostgres struct {
	conn db.Connection
}

func (r *MessageRepositoryPostgres) CreateConversation() (*model.Conversation, error) {
	q := "INSERT INTO conversations DEFAULT VALUES RETURNING *"
	createdConversation := &model.Conversation{}
	return createdConversation, r.conn.Get(createdConversation, q)
}

func (r *MessageRepositoryPostgres) CreateMessage(message *model.Message) (*model.Message, error) {
	q := `
	INSERT INTO messages (conversation_id, content, sender_id) 
	VALUES ($1, $2, $3)
	RETURNING *
	`

	createdMessage := &model.Message{}

	return createdMessage, r.conn.Get(createdMessage, q, message.ConversationId, message.Content, message.SenderId)
}

func (r *MessageRepositoryPostgres) ListMessages(conversationId int64) ([]model.Message, error) {
	q := `
	SELECT *
	FROM messages
	WHERE conversation_id = $1
`
	messages := []model.Message{}
	return messages, r.conn.Select(&messages, q, conversationId)
}
