package impl

import (
	"context"
	apperror "main/error"
	"main/service"
	"main/telegram"
	"net/url"
	"regexp"
	"strings"
)

func NewTelegramBotService(bot telegram.BotClient, baseURL string) service.TelegramBotService {
	return &telegramBotService{bot: bot, baseURL: strings.TrimRight(baseURL, "/")}
}

type telegramBotService struct {
	bot     telegram.BotClient
	baseURL string
}

func (s *telegramBotService) HandleUpdate(ctx context.Context, update telegram.Update) error {
	if update.Message == nil || update.Message.Chat.Type != "private" {
		return nil
	}
	fields := strings.Fields(update.Message.Text)
	if len(fields) == 0 || (fields[0] != "/start" && !strings.HasPrefix(fields[0], "/start@")) {
		return nil
	}
	miniAppURL := s.baseURL + "/miniapp/telegram"
	if len(fields) > 1 && fields[1] != "auth" {
		if len(fields) != 2 || !regexp.MustCompile(`^link_[0-9a-f-]{36}_[A-Za-z0-9]{22}$`).MatchString(fields[1]) {
			return nil
		}
		miniAppURL += "?link_code=" + url.QueryEscape(fields[1])
	}
	if s.baseURL == "" {
		return apperror.NewError(apperror.OAuthError, "Авторизация через Telegram временно недоступна")
	}
	err := s.bot.SendMiniApp(
		ctx,
		update.Message.Chat.ID,
		"Привет! 👋 Добро пожаловать в MyWishlists — место для ваших желаний и идей для подарков 🎁\n\nНажмите кнопку ниже, чтобы войти через Telegram и заглянуть в свои вишлисты.",
		miniAppURL,
	)
	if err != nil {
		return apperror.NewError(apperror.OAuthError, "Не удалось подготовить вход через Telegram")
	}
	return nil
}
