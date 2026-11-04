package impl

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	apperror "main/error"
	"main/mail"
	"main/model"
	"main/uof"

	"github.com/jackc/pgx/v5/pgconn"
)

func (u *userServiceImpl) RequestEmailChange(ctx context.Context, userId int64, email string) (*model.Code, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	cooldownKey := fmt.Sprintf("change-email:%d:cooldown", userId)
	ttl, err := u.CodeRepository.GetEmailCountDown(cooldownKey)
	if err != nil {
		return nil, apperror.NewError(apperror.WrongRequest, "Не удалось отправить код")
	}
	if ttl > 0 {
		return nil, apperror.NewError(apperror.EmailCountDown, "Повторная отправка кода доступна через 30 секунд")
	}
	code := model.NewCode(userId, 6, 64, model.ChangeEmailCode, 3)
	code.Email = email
	template, err := mail.LoadTemplate("email_change")
	if err != nil {
		return nil, apperror.NewError(apperror.WrongRequest, "Не удалось подготовить письмо")
	}
	if _, err = u.CodeRepository.Create(code); err != nil {
		return nil, apperror.NewError(apperror.WrongRequest, "Не удалось сохранить код")
	}
	if err = u.CodeRepository.SaveEmailCountDown(cooldownKey, 30*time.Second); err != nil {
		return nil, apperror.NewError(apperror.WrongRequest, "Не удалось отправить код")
	}
	if err = u.MailClient.Send([]string{email}, "Подтвердите ваш e-mail", mail.CompileTemplate(template, map[string]string{"code": code.Code})); err != nil {
		return nil, apperror.NewError(apperror.WrongRequest, "Не удалось отправить письмо. Повторите попытку позже")
	}
	return code, nil
}

func (u *userServiceImpl) ConfirmEmailChange(ctx context.Context, userId int64, code *model.Code) (*model.User, error) {
	code.UserId = userId
	code.Key = ""
	confirmed, correct := u.CheckCodeWithType(ctx, code, model.ChangeEmailCode, true)
	if confirmed.UUID == "" {
		return nil, apperror.NewError(apperror.CodeIsNotFound, "Код устарел. Запросите новый код")
	}
	if !correct {
		return nil, apperror.NewErrorWithData(apperror.WrongCode, fmt.Sprintf("Некорректный код. Осталось попыток: %d", confirmed.AttemptsCount), strconv.Itoa(confirmed.AttemptsCount))
	}
	if err := u.CodeRepository.DeleteByUUID(confirmed.UUID); err != nil {
		return nil, apperror.NewError(apperror.WrongRequest, "Не удалось подтвердить код")
	}
	var user *model.User
	err := u.UnitOfWork.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		exists, err := store.UserRepository().GetByEmail(confirmed.Email)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return apperror.NewError(apperror.DatabaseError, "Не удалось проверить email")
		}
		if exists != nil && exists.Id != 0 && exists.Id != userId {
			return apperror.NewError(apperror.UserAlreadyExists, "Этот email уже занят")
		}
		user, err = store.UserRepository().UpdateEmail(userId, confirmed.Email)
		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23505" {
				return apperror.NewError(apperror.UserAlreadyExists, "Этот email уже занят")
			}
			return apperror.NewError(apperror.DatabaseError, "Не удалось сохранить email")
		}
		return nil
	})
	return user, err
}
