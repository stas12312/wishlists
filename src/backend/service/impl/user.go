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
	codeRepository repository.ConfirmCodeRepository,
	mailClient mail.Client,
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
	repository.ConfirmCodeRepository
	mail.Client
	*config.Config
}

func (u *userServiceImpl) Register(email, password, name string) (*model.User, *model.ConfirmCode, error) {

	hash, _ := hashPassword(password)

	existsUser, err := u.UserRepository.GetByEmail(email)
	if existsUser.Id != 0 && existsUser.IsActive {
		return nil, nil, errors.New("пользователь уже зарегистрирован")
	}

	user, err := u.UserRepository.Create(email, hash, name)
	if err != nil {
		return nil, nil, err
	}
	confirmCode := model.NewConfirmCode(user.Id, 6, 64)
	confirmCode.UserId = user.Id

	if _, err = u.ConfirmCodeRepository.Create(confirmCode); err != nil {
		return nil, nil, err
	}

	if err = u.Client.Send(
		[]string{email},
		"Подтвердите ваш e-mail",
		getMailMessage(confirmCode, u.Config.BaseUrl),
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

func (u *userServiceImpl) Confirm(code *model.ConfirmCode) (*model.User, bool, error) {
	confirmCode, err := u.ConfirmCodeRepository.GetByUUID(code.UUID)
	if err != nil {
		return nil, false, err
	}

	if !((confirmCode.Code == code.Code && confirmCode.SecretKey == code.SecretKey) || confirmCode.Key == code.Key) {
		return nil, false, errors.New("ошибка подтверждения")
	}

	if err = u.ConfirmCodeRepository.DeleteByUUID(confirmCode.UUID); err != nil {
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

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func getMailMessage(code *model.ConfirmCode, baseUrl string) string {
	rows := []string{
		fmt.Sprintf("Ваш код подтверждения: %s", code.Code),
		fmt.Sprintf("Ссылка для подтверждения: %s/auth/confirm?uuid=%s&key=%s", baseUrl, code.UUID, code.Key),
	}

	return strings.Join(rows, "\n")
}
