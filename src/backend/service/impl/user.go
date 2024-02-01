package impl

import (
	"golang.org/x/crypto/bcrypt"
	"main/model"
	"main/repository"
	"main/service"
)

func NewUserService(userRepository *repository.UserRepository) service.UserService {
	return &userServiceImpl{*userRepository}
}

type userServiceImpl struct {
	repository.UserRepository
}

func (u *userServiceImpl) Register(email, password, name string) (*model.User, error) {

	hash, _ := hashPassword(password)

	user, err := u.UserRepository.Create(email, hash, name)
	return user, err
}

func (u *userServiceImpl) Login(email, password string) (*model.User, error) {
	user, err := u.UserRepository.GetByEmail(email)

	if err != nil {
		return user, err
	}

	if !checkPasswordHash(password, user.Password) {
		return nil, nil
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
func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}
