package service

import "main/model"

// UserService Интерфес сервиса для работы с пользователем
type UserService interface {
	Register(email, password, name string) (*model.User, error)
	Login(email, password string) (*model.User, error)
	GetById(id int64) (*model.User, error)
	GetByEmail(email string) (*model.User, error)
}
