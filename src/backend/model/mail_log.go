package model

import (
	"time"

	"github.com/lib/pq"
)

const (
	MailStatusPending = "pending"
	MailStatusSent    = "sent"
	MailStatusFailed  = "failed"
)

type MailLog struct {
	Id         int64          `json:"id" db:"mail_log_id"`
	Recipients pq.StringArray `json:"recipients" db:"recipients"`
	Subject    string         `json:"subject" db:"subject"`
	Body       NullString     `json:"body" db:"body"`
	HasBody    bool           `json:"has_body" db:"has_body"`
	Status     string         `json:"status" db:"status"`
	Error      NullString     `json:"error" db:"error"`
	CreatedAt  time.Time      `json:"created_at" db:"created_at"`
	SentAt     NullTime       `json:"sent_at" db:"sent_at"`
}

type MailLogFilters struct {
	Status string `query:"status"`
}
