package impl

import (
	"context"
	"errors"
	"log/slog"
	"main/model"
	"main/service"
	"main/telegram"
	"regexp"
	"strings"
)

type telegramJournalRepository interface {
	Record(context.Context, telegram.Message, *int64, string, string, string) error
	Chats(context.Context, *int64, *int64, int) ([]model.TelegramChat, error)
	Messages(context.Context, *int64, *int64, int) ([]model.TelegramMessage, error)
}

type TelegramJournal struct {
	repo telegramJournalRepository
	bot  service.TelegramBotService
}

func NewTelegramJournal(repo telegramJournalRepository, bot service.TelegramBotService) *TelegramJournal {
	return &TelegramJournal{repo: repo, bot: bot}
}

var telegramLinkCodePattern = regexp.MustCompile(`link_[0-9a-f-]{36}_[A-Za-z0-9]{22}`)

func (s *TelegramJournal) HandleUpdate(ctx context.Context, update telegram.Update) error {
	message, kind := update.JournalMessage()
	if message != nil {
		text := message.Text
		if text == "" {
			text = message.Caption
		}
		text = telegramLinkCodePattern.ReplaceAllString(text, "[код привязки скрыт]")
		if err := s.repo.Record(ctx, *message, &update.ID, "incoming", kind, strings.ReplaceAll(text, "\x00", "\uFFFD")); err != nil {
			slog.Error("Не удалось записать входящее сообщение Telegram", "chat_id", message.Chat.ID, "message_id", message.ID)
			return errors.New("Не удалось записать входящее сообщение Telegram")
		}
	}
	return s.bot.HandleUpdate(ctx, update)
}

func (s *TelegramJournal) RecordSent(ctx context.Context, message telegram.Message) error {
	text := telegramLinkCodePattern.ReplaceAllString(message.Text, "[код привязки скрыт]")
	return s.repo.Record(ctx, message, nil, "outgoing", "text", strings.ReplaceAll(text, "\x00", "\uFFFD"))
}

func (s *TelegramJournal) Chats(ctx context.Context, chatID, before *int64, limit int) ([]model.TelegramChat, error) {
	return s.repo.Chats(ctx, chatID, before, limit)
}

func (s *TelegramJournal) Messages(ctx context.Context, chatID, before *int64, limit int) ([]model.TelegramMessage, error) {
	return s.repo.Messages(ctx, chatID, before, limit)
}
