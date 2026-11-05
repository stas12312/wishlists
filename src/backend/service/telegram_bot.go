package service

import (
	"context"
	"main/telegram"
)

type TelegramBotService interface {
	HandleUpdate(ctx context.Context, update telegram.Update) error
}
