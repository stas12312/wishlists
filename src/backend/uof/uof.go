package uof

import (
	"context"
	"main/repository"
)

//go:generate mockery --name UnitOfWork
type UnitOfWork interface {
	Do(context.Context, func(ctx context.Context, store UnitOfWorkStore) error) error
}

type UnitOfWorkStore interface {
	UserRepository() repository.UserRepository
	WishlistRepository() repository.WishlistRepository
	WishRepository() repository.WishRepository
	OAuthRepository() repository.OAuthUserRepository
}
