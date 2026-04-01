package model

import "time"

type Ticket struct {
	Id             int64          `json:"id" db:"ticket_id"`
	Title          string         `json:"title" db:"title"`
	Status         string         `json:"status" db:"status"`
	CreatedAt      time.Time      `json:"created_at" db:"created_at"`
	ClosedAt       NullTime       `json:"closed_at" db:"closed_at"`
	AuthorId       int64          `json:"author_id" db:"author_id"`
	ConversationId int64          `json:"conversation_id" db:"conversation_id"`
	CategoryId     int            `json:"category_id" db:"category_id"`
	Category       TicketCategory `json:"category" db:"category"`
	Subject        string         `json:"subject" db:"subject"`
	Author         UserDefault    `json:"author" db:"author"`
}

type TicketCategory struct {
	Id       int64  `json:"id" db:"category_id"`
	Title    string `json:"title" db:"title"`
	Color    string `json:"color" db:"color"`
	IsActive bool   `json:"is_active" db:"is_active"`
}

type TicketFilters struct {
	Status     string
	CategoryId int
}
