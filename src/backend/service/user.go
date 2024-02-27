package service

import (
	"context"
	"main/model"
)

//go:generate mockery --name UserService

type UserService interface {
	Register(ctx context.Context, email, password, name string) (*model.User, *model.Code, error)
	Login(ctx context.Context, email, password string) (*model.User, error)
	GetById(ctx context.Context, id int64) (*model.User, error)
	GetByEmail(ctx context.Context, email string) (*model.User, error)
	Confirm(ctx context.Context, code *model.Code) (*model.User, error)
	Restore(ctx context.Context, email string) (*model.Code, error)
	Reset(ctx context.Context, code *model.Code, password string) (*model.User, error)
	CheckCode(ctx context.Context, code *model.Code, withAttempt bool) (*model.Code, bool)
}
