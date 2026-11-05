package service

import (
	"context"
	"main/model"
)

type TelegramService interface {
	Authenticate(ctx context.Context, initData string) (*model.User, error)
	Register(ctx context.Context, initData string) (*model.User, error)
	Link(ctx context.Context, userID int64, initData string) (*model.User, error)
	CreateLinkCode(ctx context.Context, userID int64) (string, error)
	RedeemLinkCode(ctx context.Context, initData, payload string) (*model.User, error)
	Unlink(ctx context.Context, targetID, expectedUserID int64, initData string) error
}
