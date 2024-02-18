package impl

import (
	"errors"
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"main/config"
	"main/mail"
	"main/model"
	"main/repository"
	"main/service"
	"strings"
)

func NewUserService(
	userRepository repository.UserRepository,
	codeRepository repository.CodeRepository,
	mailClient mail.MailClient,
	config *config.Config,
) service.UserService {
	return &userServiceImpl{
		userRepository,
		codeRepository,
		mailClient,
		config,
	}
}

type userServiceImpl struct {
	repository.UserRepository
	repository.CodeRepository
	mail.MailClient
	*config.Config
}

func (u *userServiceImpl) Register(email, password, name string) (*model.User, *model.Code, error) {

	hash, _ := hashPassword(password)

	existsUser, err := u.UserRepository.GetByEmail(email)
	if existsUser.Id != 0 && existsUser.IsActive {
		return nil, nil, errors.New("пользователь уже зарегистрирован")
	}

	user, err := u.UserRepository.Create(email, hash, name)
	if err != nil {
		return nil, nil, err
	}
	confirmCode := model.NewCode(user.Id, 6, 64, model.ConfirmEmailCode)
	confirmCode.UserId = user.Id

	if _, err = u.CodeRepository.Create(confirmCode); err != nil {
		return nil, nil, err
	}

	if err = u.MailClient.Send(
		[]string{email},
		"Подтвердите ваш e-mail",
		getConfirmEmailMessage(confirmCode, u.Config.BaseUrl),
	); err != nil {
		return nil, nil, err
	}

	return user, confirmCode, err
}

func (u *userServiceImpl) Login(email, password string) (*model.User, error) {
	user, err := u.UserRepository.GetByEmail(email)

	if err != nil {
		return user, err
	}

	if !checkPasswordHash(password, user.Password) {
		return nil, errors.New("wrong password")
	}

	if !user.IsActive {
		return nil, errors.New("не подтверждена почта")
	}

	return user, err
}

func (u *userServiceImpl) GetById(id int64) (*model.User, error) {

	user, err := u.UserRepository.GetById(id)

	return user, err
}

func (u *userServiceImpl) GetByEmail(email string) (*model.User, error) {
	user, err := u.UserRepository.GetByEmail(email)
	return user, err
}

func (u *userServiceImpl) Confirm(code *model.Code) (*model.User, bool, error) {
	confirmCode, isCorrect := u.CheckCodeWithType(code, model.ConfirmEmailCode)
	if !isCorrect {
		return nil, false, errors.New("incorrect code")
	}

	if err := u.CodeRepository.DeleteByUUID(confirmCode.UUID); err != nil {
		return nil, false, err
	}

	user, err := u.UserRepository.GetById(confirmCode.UserId)
	if err != nil {
		return nil, false, err
	}

	user.IsActive = true
	user, err = u.Update(user)

	autoLogin := code.Code == confirmCode.Code && code.SecretKey == confirmCode.SecretKey

	return user, autoLogin, err
}

func (u *userServiceImpl) Restore(email string) (*model.Code, error) {

	user, err := u.UserRepository.GetByEmail(email)
	if err != nil {
		return &model.Code{}, err
	}
	if !user.IsActive {
		return &model.Code{}, errors.New("user is not active")
	}

	code := model.NewCode(user.Id, 6, 64, model.ResetPasswordCode)
	_, err = u.CodeRepository.Create(code)
	if err != nil {
		return code, err
	}

	if err = u.MailClient.Send(
		[]string{user.Email},
		"Восстановление пароля",
		getRestorePasswordMessage(code, u.Config.BaseUrl),
	); err != nil {
		return nil, err
	}

	return code, nil
}

func (u *userServiceImpl) Reset(code *model.Code, password *model.ResetPassword) (*model.User, error) {
	dbCode, isCorrect := u.CheckCodeWithType(code, model.ResetPasswordCode)

	if !isCorrect {
		return nil, errors.New("incorrect code")
	}

	hash, _ := hashPassword(password.Password)
	if err := u.UserRepository.UpdatePassword(dbCode.UserId, hash); err != nil {
		return nil, err
	}

	if err := u.CodeRepository.DeleteByUUID(dbCode.UUID); err != nil {
		return nil, err
	}

	return u.UserRepository.GetById(dbCode.UserId)

}

func (u *userServiceImpl) CheckCode(code *model.Code) (*model.Code, bool) {
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

func (u *userServiceImpl) CheckCodeWithType(code *model.Code, codeType int) (*model.Code, bool) {
	DBCode, isCorrect := u.CheckCode(code)
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
