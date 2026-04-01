package repository

import "main/model"

type TicketRepository interface {
	Create(ticket *model.Ticket) (*model.Ticket, error)
	List(userId int64, ticketId int64, navigation model.Navigation, filters model.TicketFilters) ([]model.Ticket, error)
	Get(id int64) (*model.Ticket, error)
	Update(ticket *model.Ticket) (*model.Ticket, error)
	Delete(id int64) error
}
