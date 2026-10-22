package service

import "main/model"

type MailLogService interface {
	Get(id int64) (*model.MailLog, error)
	ClearOldBodies() (int64, error)
	List(filters model.MailLogFilters, navigation model.Navigation) ([]model.MailLog, error)
}
