package impl

import (
	"fmt"
	apperror "main/error"
	"main/model"
	"main/repository"
	"main/service"
	"strings"
)

func NewTicketServiceImpl(
	ticketRepository repository.TicketRepository,
	categoryRepository repository.TicketCategoryRepository,
	messageService service.MessageService,
	wsService service.WSService,
) *TicketServiceImpl {
	return &TicketServiceImpl{
		ticketRepository:         ticketRepository,
		ticketCategoryRepository: categoryRepository,
		messageService:           messageService,
		wsService:                wsService,
	}
}

type TicketServiceImpl struct {
	ticketRepository         repository.TicketRepository
	ticketCategoryRepository repository.TicketCategoryRepository
	messageService           service.MessageService
	wsService                service.WSService
}

func (t *TicketServiceImpl) CreateCategory(ticketCategory *model.TicketCategory) (*model.TicketCategory, error) {
	return t.ticketCategoryRepository.Create(ticketCategory)
}

func (t *TicketServiceImpl) ListCategory() ([]model.TicketCategory, error) {
	return t.ticketCategoryRepository.List()
}

func (t *TicketServiceImpl) Create(ticket *model.Ticket, message *model.Message) (*model.Ticket, error) {
	conversation, err := t.messageService.CreateConversation()
	if err != nil {
		return nil, err
	}
	_, err = t.messageService.CreateMessage(ticket.AuthorId, conversation.Id, message.Content)
	if err != nil {
		return nil, err
	}
	ticket.ConversationId = conversation.Id
	return t.ticketRepository.Create(ticket)
}

func (t *TicketServiceImpl) List(userId int64, navigation model.Navigation, filters model.TicketFilters) ([]model.Ticket, error) {
	return t.ticketRepository.List(userId, 0, navigation, filters)
}

func (t *TicketServiceImpl) Get(userId int64, id int64) (*model.Ticket, error) {
	tickets, err := t.ticketRepository.List(userId, id, model.Navigation{Cursor: []string{""}, Count: 1}, model.TicketFilters{})
	if len(tickets) == 0 || err != nil {
		return nil, apperror.NewError(apperror.NotFound, "Обращение на найдено")
	}
	if userId > 0 && tickets[0].AuthorId != userId {
		return nil, apperror.NewError(apperror.NotFound, "Обращение не найдено")
	}

	return &tickets[0], nil
}

func (t *TicketServiceImpl) GetConversation(userId int64, ticketId int64) ([]model.Message, error) {
	ticket, err := t.Get(userId, ticketId)
	if err != nil {
		return nil, err
	}
	return t.messageService.ListMessages(ticket.ConversationId)
}

func (t *TicketServiceImpl) AddMessage(userId int64, ticketId int64, message *model.Message) (*model.Message, error) {
	ticket, err := t.Get(userId, ticketId)
	if err != nil {
		return nil, err
	}

	createdMessage, err := t.messageService.CreateMessage(userId, ticket.ConversationId, message.Content)
	if err != nil {
		return nil, err
	}
	if ticket.Status == "waiting" || ticket.Status == "closed" {
		_, err = t.ticketRepository.Update(&model.Ticket{Id: ticketId, Status: "open"})
		if err != nil {
			return nil, err
		}
	}
	t.wsService.SendMessageToChannel(getChannelNameForTicket(ticketId), model.WSMessage{
		Event: service.Update,
	})
	return createdMessage, nil
}

func (t *TicketServiceImpl) AddMessageFromAdmin(userId int64, ticketId int64, message *model.Message) (*model.Message, error) {
	ticket, err := t.Get(0, ticketId)
	if err != nil {
		return nil, err
	}
	content, status := splitMessage(message.Content)
	message.Content = content

	if status != "" {
		_, err = t.ticketRepository.Update(&model.Ticket{Id: ticketId, Status: status})
		if err != nil {
			return nil, err
		}
		t.wsService.SendMessage(userId, model.WSMessage{Event: service.ChangeTicketsCount})
	}

	createdMessage, err := t.messageService.CreateMessage(userId, ticket.ConversationId, message.Content)
	if err != nil {
		return nil, err
	}
	t.wsService.SendMessageToChannel(getChannelNameForTicket(ticketId), model.WSMessage{
		Event: service.Update,
	})
	return createdMessage, nil
}

func (t *TicketServiceImpl) Close(userId int64, ticketId int64) error {
	_, err := t.Get(userId, ticketId)
	if err != nil {
		return err
	}
	_, err = t.ticketRepository.Update(&model.Ticket{Id: ticketId, Status: "closed"})
	if err != nil {
		return err
	}
	t.wsService.SendMessageToChannel(getChannelNameForTicket(ticketId), model.WSMessage{
		Event: service.Update,
	})
	t.wsService.SendMessage(userId, model.WSMessage{Event: service.ChangeTicketsCount})
	return nil
}

func (t *TicketServiceImpl) GetCounters(userId int64) (int, error) {
	return t.ticketRepository.GetCounters(userId)
}

func splitMessage(content string) (string, string) {
	parts := strings.Split(content, "//")
	if len(parts) != 2 {
		return parts[0], ""
	}
	return parts[0], parts[1]
}

func getChannelNameForTicket(ticketId int64) string {
	return fmt.Sprintf("ticket_%d", ticketId)
}
