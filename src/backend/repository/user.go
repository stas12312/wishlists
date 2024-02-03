package repository

import "main/model"

//go:generate mockery --name UserRepository

type UserRepository interface {
	GetByEmail(email string) (*model.User, error)
	GetById(id int64) (*model.User, error)
	Create(email string, hash string, name string) (*model.User, error)
}
