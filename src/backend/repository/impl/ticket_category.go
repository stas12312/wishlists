package impl

import (
	"main/db"
	"main/model"
)

func NewTicketCategoryRepositoryPostgres(conn db.Connection) TicketCategoryRepositoryPostgres {
	return TicketCategoryRepositoryPostgres{conn: conn}
}

type TicketCategoryRepositoryPostgres struct {
	conn db.Connection
}

func (t TicketCategoryRepositoryPostgres) Create(ticketCategory *model.TicketCategory) (*model.TicketCategory, error) {
	q := `
	INSERT INTO ticket_categories (title, color) 
	VALUES ($1, $2)
	RETURNING *
`
	newTicketCategory := &model.TicketCategory{}
	return newTicketCategory, t.conn.Get(newTicketCategory, q, ticketCategory.Title, ticketCategory.Color)
}

func (t TicketCategoryRepositoryPostgres) List() ([]model.TicketCategory, error) {
	q := `
	SELECT * FROM ticket_categories
`
	newTicketCategories := []model.TicketCategory{}
	return newTicketCategories, t.conn.Select(&newTicketCategories, q)
}

func (t TicketCategoryRepositoryPostgres) Update(ticketCategory *model.TicketCategory) (*model.TicketCategory, error) {
	//TODO implement me
	panic("implement me")
}
