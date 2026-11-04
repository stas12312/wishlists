package service

import "main/model"

type AdminUserService interface {
	List(search string, before int64, count int) ([]model.AdminUser, error)
	Get(id int64) (*model.AdminUserDetail, error)
	DeleteLink(id int64, provider, externalID string) error
}
