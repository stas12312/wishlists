package service

import "main/model"

type AdminNotificationService interface {
	SupportsKind(kind string) bool
	ListAdmin(filter model.AdminNotificationFilter, limit int) ([]model.AdminNotification, error)
	GetAdmin(id int64) (*model.AdminNotificationDetail, error)
}
