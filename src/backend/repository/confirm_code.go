package repository

import "main/model"

//go:generate mockery --name ConfirmCodeRepository

type ConfirmCodeRepository interface {
	Create(code *model.ConfirmCode) (*model.ConfirmCode, error)
	GetByUUID(uuid string) (*model.ConfirmCode, error)
	DeleteByUUID(uuid string) error
}
