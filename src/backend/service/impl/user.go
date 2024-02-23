package impl

import (
	"context"
	"errors"
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"main/config"
	"main/mail"
	"main/model"
	"main/repository"
	"main/service"
	"main/uof"
	"strings"
)

func NewUserService(
	uof uof.UnitOfWork,
	codeRepository repository.CodeRepository,
	mailClient mail.MailClient,
	config *config.Config,
) service.UserService {
	return &userServiceImpl{
		uof,
		codeRepository,
		mailClient,
		config,
	}
}

type userServiceImpl struct {
	uof.UnitOfWork
	repository.CodeRepository
	mail.MailClient
	*config.Config
}

func (u *userServiceImpl) Register(ctx context.Context, email, password, name string) (*model.User, *model.Code, error) {

	user := &model.User{}
	code := &model.Code{}

	err := u.UnitOfWork.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		hash, _ := hashPassword(password)

		existsUser, err := store.UserRepository().GetByEmail(email)
		if existsUser.Id != 0 && existsUser.IsActive {
			return errors.New("пользователь уже зарегистрирован")
		}

		user, err = store.UserRepository().Create(email, hash, name)
		if err != nil {
			return err
		}
		code = model.NewCode(user.Id, 6, 64, model.ConfirmEmailCode)
		code.UserId = user.Id

		_, err = u.CodeRepository.Create(code)
		if err != nil {
			return err
		}
		err = u.MailClient.Send(
			[]string{email},
			"Подтвердите ваш e-mail",
			getConfirmEmailMessage(code, u.Config.BaseUrl),
		)
		return err
	})

	return user, code, err
}

func (u *userServiceImpl) Login(ctx context.Context, email, password string) (*model.User, error) {

	resultUser := &model.User{}

	err := u.UnitOfWork.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		user, err := store.UserRepository().GetByEmail(email)
		if err != nil {
			return err
		}

		if !checkPasswordHash(password, user.Password) {
			return errors.New("wrong password")
		}

		if !user.IsActive {
			return errors.New("не подтверждена почта")
		}

		resultUser = user
		return nil
	})

	return resultUser, err
}

func (u *userServiceImpl) GetById(ctx context.Context, id int64) (*model.User, error) {
	resultUser := &model.User{}

	err := u.UnitOfWork.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		user, err := store.UserRepository().GetById(id)
		resultUser = user
		return err
	})

	return resultUser, err
}

func (u *userServiceImpl) GetByEmail(ctx context.Context, email string) (*model.User, error) {

	resultUser := &model.User{}
	err := u.UnitOfWork.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		user, err := store.UserRepository().GetByEmail(email)
		resultUser = user
		return err
	})
	return resultUser, err
}

func (u *userServiceImpl) Confirm(ctx context.Context, code *model.Code) (*model.User, bool, error) {

	resultUser := &model.User{}
	resultCode := &model.Code{}

	err := u.UnitOfWork.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		dbCode, isCorrect := u.CheckCodeWithType(ctx, code, model.ConfirmEmailCode)
		if !isCorrect {
			return errors.New("incorrect code")
		}

		if err := u.CodeRepository.DeleteByUUID(dbCode.UUID); err != nil {
			return err
		}

		user, err := store.UserRepository().GetById(dbCode.UserId)
		if err != nil {
			return err
		}

		user.IsActive = true
		user, err = store.UserRepository().Update(user)
		resultUser = user
		resultCode = dbCode
		return err
	})
	if err != nil {
		return resultUser, false, err
	}

	autoLogin := code.Code == resultCode.Code && code.SecretKey == resultCode.SecretKey

	return resultUser, autoLogin, err
}

func (u *userServiceImpl) Restore(ctx context.Context, email string) (*model.Code, error) {

	resultCode := &model.Code{}

	err := u.UnitOfWork.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		user, err := store.UserRepository().GetByEmail(email)
		if err != nil {
			return err
		}
		if !user.IsActive {
			return errors.New("user is not active")
		}

		code := model.NewCode(user.Id, 6, 64, model.ResetPasswordCode)
		_, err = u.CodeRepository.Create(code)
		if err != nil {
			return err
		}

		if err = u.MailClient.Send(
			[]string{user.Email},
			"Восстановление пароля",
			getRestorePasswordMessage(code, u.Config.BaseUrl),
		); err != nil {
			return err
		}

		resultCode = code
		return nil
	})

	return resultCode, err
}

func (u *userServiceImpl) Reset(
	ctx context.Context,
	code *model.Code,
	password *model.ResetPassword,
) (*model.User, error) {

	resultUser := &model.User{}

	err := u.UnitOfWork.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		dbCode, isCorrect := u.CheckCodeWithType(ctx, code, model.ResetPasswordCode)

		if !isCorrect {
			return errors.New("incorrect code")
		}

		hash, _ := hashPassword(password.Password)
		if err := store.UserRepository().UpdatePassword(dbCode.UserId, hash); err != nil {
			return err
		}

		if err := u.CodeRepository.DeleteByUUID(dbCode.UUID); err != nil {
			return err
		}

		user, err := store.UserRepository().GetById(dbCode.UserId)
		if err != nil {
			return err
		}
		resultUser = user
		return nil
	})

	return resultUser, err

}

func (u *userServiceImpl) CheckCode(ctx context.Context, code *model.Code) (*model.Code, bool) {
	DBCode, err := u.CodeRepository.Get(code.UUID)
	if err != nil {
		return nil, false
	}
	if DBCode.UUID == "" {
		return nil, false
	}
	if !((DBCode.Code == code.Code && DBCode.SecretKey == code.SecretKey) || DBCode.Key == code.Key) {
		return nil, false
	}
	return DBCode, true
}

func (u *userServiceImpl) CheckCodeWithType(
	ctx context.Context,
	code *model.Code,
	codeType int,
) (*model.Code, bool) {
	DBCode, isCorrect := u.CheckCode(ctx, code)
	if !isCorrect {
		return DBCode, isCorrect
	}
	if DBCode.CodeType != codeType {
		return DBCode, false
	}
	return DBCode, true
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func getConfirmEmailMessage(code *model.Code, baseUrl string) string {
	rows := []string{
		fmt.Sprintf("Ваш код подтверждения: %s", code.Code),
		fmt.Sprintf("Ссылка для подтверждения: %s/auth/confirm?uuid=%s&key=%s", baseUrl, code.UUID, code.Key),
	}

	return strings.Join(rows, "\n")
}

func getRestorePasswordMessage(code *model.Code, baseUrl string) string {
	rows := []string{
		fmt.Sprintf("Код для сброса пароля: %s", code.Code),
		fmt.Sprintf("Ссылка для сброса пароля: %s/auth/reset-password?uuid=%s&key=%s", baseUrl, code.UUID, code.Key),
	}

	return strings.Join(rows, "\n")
}
