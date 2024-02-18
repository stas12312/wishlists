package service

import "main/model"

//go:generate mockery --name UserService

type UserService interface {
	Register(email, password, name string) (*model.User, *model.Code, error)
	Login(email, password string) (*model.User, error)
	GetById(id int64) (*model.User, error)
	GetByEmail(email string) (*model.User, error)
	Confirm(code *model.Code) (*model.User, bool, error)
	Restore(email string) (*model.Code, error)
	Reset(code *model.Code, password *model.ResetPassword) (*model.User, error)
	CheckCode(code *model.Code) (*model.Code, bool)
}
