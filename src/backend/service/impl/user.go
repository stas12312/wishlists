package impl

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"main/config"
	apperror "main/error"
	"main/mail"
	"main/model"
	"main/oauth"
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
	manager *oauth.Manager,
) service.UserService {
	return &userServiceImpl{
		uof,
		codeRepository,
		mailClient,
		config,
		manager,
	}
}

type userServiceImpl struct {
	uof.UnitOfWork
	repository.CodeRepository
	mail.MailClient
	*config.Config
	*oauth.Manager
}

func (u *userServiceImpl) Register(ctx context.Context, email, password, name string) (*model.User, *model.Code, error) {

	user := &model.User{}
	code := &model.Code{}

	err := u.UnitOfWork.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		hash, _ := hashPassword(password)

		existsUser, err := store.UserRepository().GetByEmail(email)
		if existsUser.Id != 0 && existsUser.IsActive {
			return apperror.NewError(
				apperror.UserAlreadyExists,
				"Пользователь с указанным email уже зарегистрирован",
			)
		}

		user, err = store.UserRepository().Create(email, hash, name, false)
		if err != nil {
			return err
		}
		code = model.NewCode(user.Id, 6, 64, model.ConfirmEmailCode, 3)

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
			return apperror.NewError(apperror.WrongPassword, "Некорректный email или пароль")
		}

		if !checkPasswordHash(password, user.Password) {
			return apperror.NewError(apperror.WrongPassword, "Некорректный email или пароль")
		}

		if !user.IsActive {
			return apperror.NewError(apperror.NotConfirmEmail, "Не подтвержден email")
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

func (u *userServiceImpl) Confirm(ctx context.Context, code *model.Code) (*model.User, error) {

	resultUser := &model.User{}

	err := u.UnitOfWork.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		dbCode, isCorrect := u.CheckCodeWithType(ctx, code, model.ConfirmEmailCode, true)

		if dbCode.UUID == "" {
			return apperror.NewError(
				apperror.WrongCode,
				"Код устарел",
			)
		}

		if !isCorrect {
			return apperror.NewError(
				apperror.WrongCode,
				fmt.Sprintf("Некорректный код. Осталось попыток: %d", dbCode.AttemptsCount),
			)
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
		return err
	})

	return resultUser, err
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

		code := model.NewCode(user.Id, 6, 64, model.ResetPasswordCode, 3)
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
	password string,
) (*model.User, error) {

	resultUser := &model.User{}

	err := u.UnitOfWork.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		dbCode, isCorrect := u.CheckCodeWithType(ctx, code, model.ResetPasswordCode, false)
		if err := u.CodeRepository.DeleteByUUID(dbCode.UUID); err != nil {
			return err
		}

		if !isCorrect {
			return errors.New("incorrect code")
		}

		hash, _ := hashPassword(password)
		if err := store.UserRepository().UpdatePassword(dbCode.UserId, hash); err != nil {
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

func (u *userServiceImpl) CheckCode(
	ctx context.Context,
	code *model.Code,
	checkAttempt bool,
) (*model.Code, bool) {
	DBCode, err := u.CodeRepository.Get(code.UUID)
	if err != nil {
		return DBCode, false
	}
	if DBCode.UUID == "" {
		return DBCode, false
	}

	equalsByCode := DBCode.Code == code.Code && DBCode.SecretKey == code.SecretKey
	equalsByKey := DBCode.Key == code.Key
	hasAttempt := DBCode.AttemptsCount > 0 && checkAttempt
	codeIsCorrect := equalsByKey || equalsByCode && hasAttempt

	if !checkAttempt {
		return DBCode, codeIsCorrect
	}

	if hasAttempt && !codeIsCorrect {
		DBCode.AttemptsCount -= 1

		if DBCode.AttemptsCount == 0 {
			err = u.CodeRepository.DeleteByUUID(DBCode.UUID)
		} else {
			err = u.CodeRepository.Update(DBCode)
		}
		if err != nil {
			return DBCode, false
		}
	}

	return DBCode, codeIsCorrect
}

func (u *userServiceImpl) CheckCodeWithType(
	ctx context.Context,
	code *model.Code,
	codeType int,
	withAttempt bool,
) (*model.Code, bool) {
	DBCode, isCorrect := u.CheckCode(ctx, code, withAttempt)
	if DBCode.CodeType != codeType {
		return DBCode, false
	}
	return DBCode, isCorrect
}

func (u *userServiceImpl) OAuthAuth(
	ctx context.Context,
	userId int64,
	provider string,
	token string,
) (*model.User, error) {

	client := u.GetClientByProvider(provider)
	var user *model.User

	err := u.UnitOfWork.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		userFromOAuth, err := client.GetUserInfo(token)
		if err != nil {
			return apperror.NewError(apperror.OAuthError, "Не удалось авторизоваться через OAuth")
		}
		existsOAuthUser, err := store.OAuthRepository().Get(provider, userFromOAuth.Id)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return apperror.NewError(apperror.DatabaseError, "Ошибка при получении OAuth пользователя")
		}

		if existsOAuthUser.UserId != 0 && userId != 0 {
			existsOAuthUser.UserId = userId
			err = store.OAuthRepository().Update(existsOAuthUser)
			if err != nil {
				return apperror.NewError(apperror.DatabaseError, "Ошибка при смене пользователя")
			}
			user, err = store.UserRepository().GetById(existsOAuthUser.UserId)
			if err != nil {
				return apperror.NewError(apperror.DatabaseError, "Ошибка при смене пользователя")
			}
			return nil
		} else if existsOAuthUser.UserId != 0 {
			user, err = store.UserRepository().GetById(existsOAuthUser.UserId)
			if err != nil {
				return apperror.NewError(apperror.DatabaseError, "Ошибка при получении пользователя")
			}
			return nil
		}

		oAuthUser := &model.OAuthUser{
			Provider:    provider,
			OAuthUserId: userFromOAuth.Id,
		}

		existsUser, err := store.UserRepository().GetByEmail(userFromOAuth.Email)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return apperror.NewError(apperror.DatabaseError, "Ошибка при получении пользователя")
		}
		if existsUser.Id != 0 {
			oAuthUser.UserId = existsUser.Id
		} else {
			user, err = store.UserRepository().Create(userFromOAuth.Email, "", userFromOAuth.Name, true)
			if err != nil {
				return apperror.NewError(apperror.OAuthError, "Ошибка при авторизации через OAuth")
			}
			oAuthUser.UserId = user.Id
		}
		return store.OAuthRepository().Create(oAuthUser)

	})

	return user, err

}

func (u *userServiceImpl) ListOAuthProviders(ctx context.Context) []oauth.Provider {
	return u.Manager.GetProviders()
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
