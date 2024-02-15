package service

import "main/model"

//go:generate mockery --name UserService

type UserService interface {
	Register(email, password, name string) (*model.User, *model.ConfirmCode, error)
	Login(email, password string) (*model.User, error)
	GetById(id int64) (*model.User, error)
	GetByEmail(email string) (*model.User, error)
	Confirm(code *model.ConfirmCode) (*model.User, bool, error)
}
