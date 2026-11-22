package impl

import (
	"context"
	"main/model"
	"main/telegram"
	"time"

	"github.com/jmoiron/sqlx"
)

type TelegramJournalRepository struct {
	db *sqlx.DB
}

func NewTelegramJournalRepository(db *sqlx.DB) *TelegramJournalRepository {
	return &TelegramJournalRepository{db: db}
}

func (r *TelegramJournalRepository) Record(ctx context.Context, message telegram.Message, updateID *int64, direction, kind, text string) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO telegram_messages (chat_id, update_id, message_id, direction, kind, text, sent_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (update_id) DO NOTHING
	`, message.Chat.ID, updateID, message.ID, direction, kind, text, time.Unix(message.Date, 0))
	return err
}

func (r *TelegramJournalRepository) Chats(ctx context.Context, chatID, before *int64, limit int) ([]model.TelegramChat, error) {
	chats := make([]model.TelegramChat, 0, limit)
	err := r.db.SelectContext(ctx, &chats, `
		SELECT c.chat_id::text AS chat_id, u.user_id::text AS user_id, u.username
		FROM (
			SELECT DISTINCT chat_id FROM telegram_messages
			WHERE ($1::bigint IS NULL OR chat_id = $1)
			  AND ($2::bigint IS NULL OR chat_id < $2)
			ORDER BY chat_id DESC LIMIT $3
		) c
		LEFT JOIN oauth_user o ON c.chat_id > 0 AND o.provider = 'telegram' AND o.oauth_user_id = c.chat_id::text
		LEFT JOIN users u ON u.user_id = o.user_id
		ORDER BY c.chat_id DESC
	`, chatID, before, limit)
	return chats, err
}

func (r *TelegramJournalRepository) Messages(ctx context.Context, chatID int64, before *int64, limit int) ([]model.TelegramMessage, error) {
	messages := make([]model.TelegramMessage, 0, limit)
	err := r.db.SelectContext(ctx, &messages, `
		SELECT id::text, message_id::text, direction, kind, text, sent_at
		FROM telegram_messages
		WHERE chat_id = $1 AND ($2::bigint IS NULL OR id < $2)
		ORDER BY telegram_messages.id DESC LIMIT $3
	`, chatID, before, limit)
	return messages, err
}
