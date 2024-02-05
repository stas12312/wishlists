package impl

import (
	"errors"
	"main/model"
	"main/repository"
	"main/service"
)

func NewWishlistService(
	wlRepository repository.WishlistRepository,
	wRepository repository.WishRepository,
) service.WishlistService {
	return &WishlistImpl{wlRepository, wRepository}
}

type WishlistImpl struct {
	repository.WishlistRepository
	repository.WishRepository
}

func (s *WishlistImpl) Create(wishlist *model.Wishlist) (*model.Wishlist, error) {
	return s.WishlistRepository.Create(wishlist)
}

func (s *WishlistImpl) ListForUser(userId int64) ([]model.Wishlist, error) {

	return s.WishlistRepository.ListByUserId(userId)
}

func (s *WishlistImpl) GetForUserByUUID(userId int64, uuid string) (*model.Wishlist, error) {
	wishlist, err := s.WishlistRepository.GetByUUID(uuid)

	if wishlist.UserId != userId || err != nil {
		return nil, errors.New("user can't get access to the wishlist")
	}

	return wishlist, nil
}

func (s *WishlistImpl) UpdateForUser(userId int64, wishlist *model.Wishlist) (*model.Wishlist, error) {
	foundedWishlist, err := s.WishlistRepository.GetByUUID(wishlist.Uuid)
	if foundedWishlist.UserId != userId || err != nil {
		return nil, errors.New("user can't edit wishlist")
	}

	return s.WishlistRepository.Update(wishlist)
}

func (s *WishlistImpl) AddWish(userId int64, wish *model.Wish) (*model.Wish, error) {
	wishListUuid := wish.WishlistUuid
	if !s.UserCanEditWishlist(userId, wishListUuid) {
		return nil, errors.New("user can't get access to the wishlist")
	}

	wish, err := s.WishRepository.Create(wish)
	wish.UserId = userId

	return wish, err
}

func (s *WishlistImpl) ListWishesForWishlist(userId int64, wishlistUuid string) (*[]model.Wish, error) {
	if !s.UserCanEditWishlist(userId, wishlistUuid) {
		return nil, errors.New("user can't get access to the wishlist")
	}

	wishes, err := s.WishRepository.ListForWishlist(wishlistUuid)
	return wishes, err

}

func (s *WishlistImpl) UserCanEditWishlist(userId int64, wishlistUuid string) bool {
	wishlist, err := s.GetByUUID(wishlistUuid)
	return wishlist.UserId == userId && err == nil
}

func (s *WishlistImpl) DeleteWish(userId int64, wishUuid string) error {

	wish, err := s.WishRepository.Get(wishUuid)
	if wish.UserId != userId || err != nil {
		return errors.New("user can't get access to the wishlist")
	}

	return s.WishRepository.Delete(wishUuid)
}

func (s *WishlistImpl) UpdateWish(userId int64, wish *model.Wish) (*model.Wish, error) {
	existWish, err := s.WishRepository.Get(wish.Uuid)
	if existWish.UserId != userId || err != nil {
		return nil, errors.New("user can't update wish")
	}

	return s.WishRepository.Update(wish)
}
