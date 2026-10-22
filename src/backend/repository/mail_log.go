package repository

import (
	"main/model"
	"time"
)

type MailLogRepository interface {
	Create(recipients []string, subject, body string) (*model.MailLog, error)
	SetResult(id int64, sendErr error) error
	Get(id int64) (*model.MailLog, error)
	ClearBodies(olderThan time.Duration) (int64, error)
	List(filters model.MailLogFilters, navigation model.Navigation) ([]model.MailLog, error)
}
