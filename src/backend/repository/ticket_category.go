package repository

import "main/model"

type TicketCategoryRepository interface {
	Create(ticketCategory *model.TicketCategory) (*model.TicketCategory, error)
	List() ([]model.TicketCategory, error)
	Update(ticketCategory *model.TicketCategory) (*model.TicketCategory, error)
}
