package repository

import "main/model"

//go:generate mockery --name OAuthUserRepository

type OAuthUserRepository interface {
	Get(provider, oAuthUserId string) (*model.OAuthUser, error)
	Create(user *model.OAuthUser) error
	DeleteByUserId(userId int64, provider string) error
	DeleteByOAuthUserId(oAuthUserId string, provider string) error
	ListByUserId(userId int64) ([]model.OAuthUser, error)
	Update(user *model.OAuthUser) error
}
