package impl

import (
	"main/model"
	"main/repository"
	"time"
)

const mailBodyRetention = 7 * 24 * time.Hour

func NewMailLogService(repository repository.MailLogRepository) *MailLogServiceImpl {
	return &MailLogServiceImpl{repository}
}

type MailLogServiceImpl struct {
	repository repository.MailLogRepository
}

func (s MailLogServiceImpl) Get(id int64) (*model.MailLog, error) {
	return s.repository.Get(id)
}

func (s MailLogServiceImpl) ClearOldBodies() (int64, error) {
	return s.repository.ClearBodies(mailBodyRetention)
}

func (s MailLogServiceImpl) List(filters model.MailLogFilters, navigation model.Navigation) ([]model.MailLog, error) {
	return s.repository.List(filters, navigation)
}
