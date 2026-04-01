package service

import "main/model"

type TicketService interface {
	Create(ticket *model.Ticket, message *model.Message) (*model.Ticket, error)
	List(userId int64, navigation model.Navigation, filters model.TicketFilters) ([]model.Ticket, error)
	Get(userId int64, id int64) (*model.Ticket, error)
	CreateCategory(ticketCategory *model.TicketCategory) (*model.TicketCategory, error)
	ListCategory() ([]model.TicketCategory, error)
	GetConversation(userId int64, ticketId int64) ([]model.Message, error)
	AddMessage(userId int64, ticketId int64, message *model.Message) (*model.Message, error)
	AddMessageFromAdmin(userId int64, ticketId int64, message *model.Message) (*model.Message, error)
	Close(userId int64, ticketId int64) error
}
