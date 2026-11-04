package impl

import (
	"context"
	"database/sql"
	"errors"
	apperror "main/error"
	"main/model"
	"main/service"
	"main/telegram"
	"main/uof"
	"regexp"
	"strconv"
	"strings"
	"time"
)

const telegramProvider = "telegram"

var telegramUsernamePattern = regexp.MustCompile(`^[0-9A-Za-z.\-_]{3,32}$`)

func NewTelegramService(work uof.UnitOfWork, botToken string) service.TelegramService {
	return &telegramService{work: work, botToken: botToken, now: time.Now}
}

type telegramService struct {
	work     uof.UnitOfWork
	botToken string
	now      func() time.Time
}

// Отсутствие связки возвращается как (nil, nil), чтобы предложить вход или регистрацию.
func (s *telegramService) Authenticate(ctx context.Context, initData string) (*model.User, error) {
	identity, err := s.validate(initData)
	if err != nil {
		return nil, err
	}
	var user *model.User
	err = s.work.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		link, err := store.OAuthRepository().Get(telegramProvider, strconv.FormatInt(identity.ID, 10))
		if errors.Is(err, sql.ErrNoRows) {
			return nil
		}
		if err != nil {
			return err
		}
		user, err = activeTelegramUser(store, link.UserId)
		return err
	})
	if err != nil {
		return nil, telegramServiceError(err)
	}
	return user, nil
}

// userID должен поступать из проверенной сессии, а не из тела запроса.
func (s *telegramService) Link(ctx context.Context, userID int64, initData string) (*model.User, error) {
	if userID <= 0 {
		return nil, apperror.NewError(apperror.OAuthError, "Для привязки Telegram необходимо войти в аккаунт")
	}
	identity, err := s.validate(initData)
	if err != nil {
		return nil, err
	}
	var user *model.User
	err = s.work.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
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
		return store.OAuthRepository().Create(&model.OAuthUser{
			Provider: telegramProvider, OAuthUserId: telegramID, UserId: userID,
		})
	})
	if err != nil {
		return nil, telegramServiceError(err)
	}
	return user, nil
}

func (s *telegramService) Register(ctx context.Context, initData string) (*model.User, error) {
	identity, err := s.validate(initData)
	if err != nil {
		return nil, err
	}
	var user *model.User
	for attempt := 0; attempt < 3; attempt++ {
		err = s.work.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
			telegramID := strconv.FormatInt(identity.ID, 10)
			link, err := store.OAuthRepository().Get(telegramProvider, telegramID)
			if err == nil {
				user, err = activeTelegramUser(store, link.UserId)
				return err
			}
			if !errors.Is(err, sql.ErrNoRows) {
				return err
			}
			username := identity.Username
			if telegramUsernamePattern.MatchString(username) {
				_, err = store.UserRepository().GetByUsername(username)
				if err == nil {
					username = ""
				} else if !errors.Is(err, sql.ErrNoRows) {
					return err
				}
			} else {
				username = ""
			}
			name := strings.TrimSpace(identity.FirstName + " " + identity.LastName)
			if name == "" {
				name = "Пользователь Telegram"
			}
			user, err = store.UserRepository().Create("", "", name, true, "", model.NullDate{})
			if err != nil {
				return err
			}
			// БД уже выдала случайный уникальный username; заменяем его только на свободный Telegram username.
			if username != "" {
				user.Username = username
				user, err = store.UserRepository().Update(user)
				if err != nil {
					return err
				}
			}
			return store.OAuthRepository().Create(&model.OAuthUser{
				Provider: telegramProvider, OAuthUserId: telegramID, UserId: user.Id,
			})
		})
		if err == nil {
			return user, nil
		}
		// После конфликта уникальности PostgreSQL требует новую транзакцию.
		var dbErr interface{ SQLState() string }
		if !errors.As(err, &dbErr) || dbErr.SQLState() != "23505" {
			break
		}
	}
	return nil, telegramServiceError(err)
}

func (s *telegramService) validate(initData string) (*telegram.User, error) {
	identity, err := telegram.ValidateInitData(initData, s.botToken, s.now(), 5*time.Minute)
	if err != nil {
		return nil, apperror.NewError(apperror.OAuthError, "Не удалось проверить данные Telegram. Откройте приложение заново")
	}
	return identity, nil
}

func activeTelegramUser(store uof.UnitOfWorkStore, userID int64) (*model.User, error) {
	user, err := store.UserRepository().GetById(userID)
	if err != nil {
		return nil, err
	}
	if !user.IsActive {
		return nil, apperror.NewError(apperror.NotConfirmEmail, "Необходимо подтвердить email аккаунта")
	}
	return user, nil
}

func telegramServiceError(err error) error {
	var appErr *apperror.Error
	if errors.As(err, &appErr) {
		return appErr
	}
	var dbErr interface{ SQLState() string }
	if errors.As(err, &dbErr) && dbErr.SQLState() == "23505" {
		return apperror.NewError(apperror.OAuthError, "Аккаунт MyWishlists или Telegram уже связан. Откройте приложение заново")
	}
	return apperror.NewError(apperror.DatabaseError, "Не удалось получить или сохранить связку Telegram")
}
