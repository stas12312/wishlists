package impl

import (
	"main/model"
	"main/repository"
)

func NewMessageServiceImpl(messageRepository repository.MessageRepository) *MessageServiceImpl {
	return &MessageServiceImpl{messageRepository}
}

type MessageServiceImpl struct {
	repository repository.MessageRepository
}

func (m MessageServiceImpl) CreateConversation() (*model.Conversation, error) {
	return m.repository.CreateConversation()
}

func (m MessageServiceImpl) CreateMessage(userId int64, conversationId int64, content string) (*model.Message, error) {

	message := &model.Message{
		ConversationId: conversationId,
		Content:        content,
		SenderId:       userId,
	}

	return m.repository.CreateMessage(message)
}

func (m MessageServiceImpl) ListMessages(conversationId int64) ([]model.Message, error) {
	return m.repository.ListMessages(conversationId)
}
