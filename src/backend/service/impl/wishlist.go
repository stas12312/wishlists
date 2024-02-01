package impl

import (
	"errors"
	"main/model"
	"main/repository"
	"main/service"
)

func NewWishlistService(repository *repository.WishlistRepository) service.WishlistService {
	return &WishlistImpl{*repository}
}

type WishlistImpl struct {
	repository.WishlistRepository
}

func (s *WishlistImpl) Create(wishlist *model.Wishlist) (*model.Wishlist, error) {
	return s.WishlistRepository.Create(wishlist)
}

func (s *WishlistImpl) ListForUser(userId int64) ([]model.Wishlist, error) {

	return s.WishlistRepository.ListByUserId(userId)
}

func (s *WishlistImpl) GetForUserByUUID(userId int64, uuid string) (*model.Wishlist, error) {
	wishlist, err := s.WishlistRepository.GetByUUID(uuid)
	if err != nil {
		return nil, err
	}

	if wishlist.UserId != userId {
		return nil, errors.New("user can't get access to the wishlist")
	}

	return wishlist, nil
}

func (s *WishlistImpl) UpdateForUser(userId int64, wishlist *model.Wishlist) (*model.Wishlist, error) {
	foundedWishlist, err := s.WishlistRepository.GetByUUID(wishlist.Uuid)
	if err != nil {
		return nil, err
	}
	if foundedWishlist.UserId != userId {
		return nil, errors.New("user can't edit wishlist")
	}

	return s.WishlistRepository.Update(wishlist)
}
