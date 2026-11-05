package repository

import (
	"main/model"
	"time"
)

//go:generate mockery --name CodeRepository
type CodeRepository interface {
	Create(code *model.Code) (*model.Code, error)
	Get(uuid string) (*model.Code, error)
	DeleteByUUID(uuid string) error
	Consume(code *model.Code) (bool, error)
	Update(code *model.Code) error
	SaveEmailCountDown(email string, duration time.Duration) error
	GetEmailCountDown(email string) (time.Duration, error)
}
