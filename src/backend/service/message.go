package service

import "main/model"

type MessageService interface {
	CreateConversation() (*model.Conversation, error)
	CreateMessage(userId int64, conversationId int64, content string) (*model.Message, error)
	ListMessages(conversationId int64) ([]model.Message, error)
}
