package model

import "time"

const (
	QuestionStatusOpen     = "open"
	QuestionStatusResolved = "resolved"
	QuestionStatusClosed   = "closed"
)

type QuestionAction struct {
	Edit   bool `json:"edit"`
	Delete bool `json:"delete"`
	Answer bool `json:"answer"`
}

type Question struct {
	Id         int64          `json:"id" db:"question_id"`
	AuthorID   int64          `json:"-" db:"author_id"`
	WishUUID   string         `json:"wish_uuid" db:"wish_uuid"`
	Content    string         `json:"content" validate:"required,min=2"`
	CreatedAt  time.Time      `json:"created_at" db:"created_at"`
	Status     string         `json:"status"`
	AnsweredId int64          `json:"answered_id" db:"answered_id"`
	Answer     *Answer        `json:"answer"`
	Actions    QuestionAction `json:"actions"`
	Wish       *Wish          `json:"wish"`
}

type Answer struct {
	Id        NullInt64  `json:"-" db:"answer_id"`
	AuthorID  NullInt64  `json:"-" db:"author_id"`
	Content   NullString `json:"content"`
	CreatedAt NullTime   `json:"created_at" db:"created_at"`
}
