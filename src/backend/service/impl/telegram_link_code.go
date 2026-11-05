package impl

import (
	"context"
	"crypto/subtle"
	"database/sql"
	"errors"
	apperror "main/error"
	"main/model"
	"main/repository"
	"main/telegram"
	"main/uof"
	"strconv"
	"strings"

	"github.com/google/uuid"
)

func (s *telegramService) RedeemLinkCode(ctx context.Context, initData, payload string) (*model.User, error) {
	if _, err := s.validate(initData); err != nil {
		return nil, err
	}
	code, err := getTelegramLinkCode(s.codes, payload)
	if err != nil {
		return nil, err
	}
	var user *model.User
	err = s.work.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		var err error
		user, err = activeTelegramUser(store, code.UserId)
		return err
	})
	if err != nil {
		return nil, telegramServiceError(err)
	}
	consumed, err := s.codes.Consume(code)
	if err != nil {
		return nil, apperror.NewError(apperror.DatabaseError, "Не удалось завершить вход через Telegram")
	}
	if !consumed {
		return nil, apperror.NewError(apperror.OAuthError, "Ссылка для подключения устарела. Получите новую в настройках")
	}
	return user, nil
}

func getTelegramLinkCode(codes repository.CodeRepository, payload string) (*model.Code, error) {
	invalid := func() (*model.Code, error) {
		return nil, apperror.NewError(apperror.OAuthError, "Ссылка для подключения устарела. Получите новую в настройках")
	}
	if len(payload) != 64 || !strings.HasPrefix(payload, "link_") {
		return invalid()
	}
	id, key, ok := strings.Cut(strings.TrimPrefix(payload, "link_"), "_")
	if !ok || len(key) != 22 {
		return invalid()
	}
	if _, err := uuid.Parse(id); err != nil {
		return invalid()
	}
	code, err := codes.Get(id)
	if err != nil || code == nil || code.CodeType != model.TelegramLinkCode || subtle.ConstantTimeCompare([]byte(code.Key), []byte(key)) != 1 {
		return invalid()
	}
	return code, nil
}

func (s *telegramService) linkIdentity(ctx context.Context, userID int64, identity *telegram.User) (*model.User, error) {
	if userID <= 0 {
		return nil, apperror.NewError(apperror.OAuthError, "Для привязки Telegram необходимо войти в аккаунт")
	}
	var user *model.User
	err := s.work.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		var err error
		user, err = activeTelegramUser(store, userID)
		if err != nil {
			return err
		}
		telegramID := strconv.FormatInt(identity.ID, 10)
		link, err := store.OAuthRepository().Get(telegramProvider, telegramID)
		if err == nil {
			if link.UserId != userID {
				return apperror.NewError(apperror.OAuthError, "Этот Telegram уже связан с другим аккаунтом")
			}
			return nil
		}
		if !errors.Is(err, sql.ErrNoRows) {
			return err
		}
		links, err := store.OAuthRepository().ListByUserId(userID)
		if err != nil {
			return err
		}
		for _, existing := range links {
			if strings.EqualFold(existing.Provider, telegramProvider) {
				return apperror.NewError(apperror.OAuthError, "К этому аккаунту уже привязан другой Telegram. Отвяжите другой Telegram в настройках и повторите попытку")
			}
		}
		return store.OAuthRepository().Create(&model.OAuthUser{
			Provider: telegramProvider, OAuthUserId: telegramID, UserId: userID,
		})
	})
	if err != nil {
		return nil, telegramServiceError(err)
	}
	return user, nil
}
