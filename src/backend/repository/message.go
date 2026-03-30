package repository

import "main/model"

type MessageRepository interface {
	CreateConversation() (*model.Conversation, error)
	CreateMessage(message *model.Message) (*model.Message, error)
	ListMessages(conversationId int64) ([]model.Message, error)
}
