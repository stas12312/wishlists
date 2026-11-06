package impl

import (
	"database/sql"
	"errors"
	apperror "main/error"
	"main/model"
	"main/repository"
	"main/service"
	"strings"
)

type adminUserService struct {
	repository repository.AdminUserRepository
}

func NewAdminUserService(repository repository.AdminUserRepository) service.AdminUserService {
	return &adminUserService{repository}
}

func adminUserError(err error) error {
	if errors.Is(err, sql.ErrNoRows) {
		return apperror.NewError(apperror.NotFound, "Пользователь или привязка не найдены")
	}
	if err != nil {
		return apperror.NewError(apperror.DatabaseError, "Не удалось получить или изменить данные пользователя")
	}
	return nil
}

func (s *adminUserService) List(search string, before int64, count int) ([]model.AdminUser, error) {
	users, err := s.repository.List(strings.TrimSpace(search), before, count)
	return users, adminUserError(err)
}

func (s *adminUserService) Get(id int64) (*model.AdminUserDetail, error) {
	user, err := s.repository.Get(id)
	if err != nil {
		return nil, adminUserError(err)
	}
	links, err := s.repository.ListLinks(id)
	if err != nil {
		return nil, adminUserError(err)
	}
	return &model.AdminUserDetail{AdminUser: *user, Links: links}, nil
}

func (s *adminUserService) DeleteLink(id int64, provider, externalID string) error {
	if (provider != "yandex" && provider != "telegram") || externalID == "" {
		return apperror.NewError(apperror.ValidateError, "Некорректная привязка")
	}
	deleted, err := s.repository.DeleteLink(id, provider, externalID)
	if err != nil {
		return adminUserError(err)
	}
	if !deleted {
		return adminUserError(sql.ErrNoRows)
	}
	return nil
}

func (s *adminUserService) ListWishlists(id int64, offset int) ([]model.AdminUserWishlist, error) {
	wishlists, err := s.repository.ListWishlists(id, offset)
	if err != nil {
		return nil, apperror.NewError(apperror.DatabaseError, "Не удалось получить вишлисты пользователя")
	}
	return wishlists, nil
}

func (s *adminUserService) SetWishlistType(id int64, uuid string, forOther bool) error {
	err := s.repository.SetWishlistType(id, uuid, forOther)
	if errors.Is(err, sql.ErrNoRows) {
		return apperror.NewError(apperror.NotFound, "Вишлист пользователя не найден")
	}
	if err != nil {
		return apperror.NewError(apperror.DatabaseError, "Не удалось изменить тип вишлиста")
	}
	return nil
}
