package impl

import (
	"main/db"
	"main/model"
)

func NewTicketRepositoryPostgres(conn db.Connection) TicketRepositoryPostgres {
	return TicketRepositoryPostgres{conn}
}

type TicketRepositoryPostgres struct {
	conn db.Connection
}

func (t TicketRepositoryPostgres) Create(ticket *model.Ticket) (*model.Ticket, error) {
	q := `
	INSERT INTO tickets (subject, category_id, conversation_id, author_id)
	VALUES ($1, $2, $3, $4)
	RETURNING *
`
	createdTicket := &model.Ticket{}
	return createdTicket, t.conn.Get(createdTicket, q, ticket.Subject, ticket.CategoryId, ticket.ConversationId, ticket.AuthorId)
}

func (t TicketRepositoryPostgres) List(userId int64, ticketId int64) ([]model.Ticket, error) {
	q := `
	SELECT 
	    tickets.*,
		
		ticket_categories.category_id AS "category.category_id",
		ticket_categories.title AS "category.title",
		ticket_categories.color AS "category.color",
		
		users.user_id AS "author.user_id",
		users.name AS "author.name",
		users.birthday AS "author.birthday",
		users.username AS "author.username",
		users.image AS "author.image"
		
	
	FROM tickets
	JOIN ticket_categories USING (category_id)
	JOIN users ON users.user_id = tickets.author_id
	WHERE 
	    CASE WHEN $1 > 0 THEN author_id = $1 ELSE TRUE END
		AND CASE WHEN $2 > 0 THEN ticket_id = $2 ELSE TRUE END
`
	tickets := []model.Ticket{}
	return tickets, t.conn.Select(&tickets, q, userId, ticketId)
}

func (t TicketRepositoryPostgres) Update(ticket *model.Ticket) (*model.Ticket, error) {
	q := `
	UPDATE tickets
		SET 
		    status = $2,
			closed_at = CASE WHEN $3 = 'closed' THEN now()  END
	
	WHERE ticket_id	= $1
	RETURNING *
`
	updatedTicket := &model.Ticket{}
	return updatedTicket, t.conn.Get(updatedTicket, q, ticket.Id, ticket.Status, ticket.Status)

}

func (t TicketRepositoryPostgres) Get(id int64) (*model.Ticket, error) {
	//TODO implement me
	panic("implement me")
}

func (t TicketRepositoryPostgres) Delete(id int64) error {
	//TODO implement me
	panic("implement me")
}
