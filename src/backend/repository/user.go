package repository

import "main/model"

//go:generate mockery --name UserRepository

type UserRepository interface {
	GetByEmail(email string) (*model.User, error)
	GetById(id int64) (*model.User, error)
	GetByUsername(username string) (*model.User, error)
	Create(email string, hash string, name string, isActive bool, image string) (*model.User, error)
	Update(*model.User) (*model.User, error)
	UpdatePassword(userId int64, hashPassword string) error
}
