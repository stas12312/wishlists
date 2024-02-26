package repository

import "main/model"

//go:generate mockery --name CodeRepository
type CodeRepository interface {
	Create(code *model.Code) (*model.Code, error)
	Get(uuid string) (*model.Code, error)
	DeleteByUUID(uuid string) error
	Update(code *model.Code) error
}
