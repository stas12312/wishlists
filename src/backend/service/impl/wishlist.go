package impl

import (
	"database/sql"
	"errors"
	apperror "main/error"
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

func (s *WishlistImpl) ListForUser(userId int64, filter model.WishlistFilter) ([]model.Wishlist, error) {

	return s.WishlistRepository.ListByUserId(userId, filter)
}

func (s *WishlistImpl) GetForUserByUUID(userId int64, uuid string) (*model.Wishlist, error) {
	wishlist, err := s.WishlistRepository.GetByUUID(uuid)
	if err != nil {
		return nil, err
	}

	if wishlist.Visible == model.Public {
		return wishlist, nil
	}

	if wishlist.UserId != userId {
		return nil, apperror.NewError(apperror.NotFound, "Вишлист не найден")
	}

	return wishlist, nil
}

func (s *WishlistImpl) UpdateForUser(userId int64, wishlist *model.Wishlist) (*model.Wishlist, error) {
	foundedWishlist, err := s.WishlistRepository.GetByUUID(wishlist.Uuid)
	if err != nil || foundedWishlist.UserId != userId {
		return nil, errors.New("user can't edit wishlist")
	}

	_, err = s.WishlistRepository.Update(wishlist)
	if err != nil {
		return nil, err
	}
	return s.WishlistRepository.GetByUUID(wishlist.Uuid)
}

func (s *WishlistImpl) DeleteWishlist(userId int64, wishlistUuid string) error {
	if !s.UserCanEditWishlist(userId, wishlistUuid) {
		return errors.New("user can't edit wishlist")
	}

	return s.WishlistRepository.Delete(wishlistUuid)
}

func (s *WishlistImpl) RestoreWishlist(userId int64, wishlistUuid string) error {
	if !s.UserCanViewWishlistByUuid(userId, wishlistUuid) {
		return errors.New("user can't edit wishlist")
	}

	return s.WishlistRepository.Restore(wishlistUuid)
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

	wishes := &[]model.Wish{}

	wishlist, err := s.WishlistRepository.GetByUUID(wishlistUuid)
	if err != nil {
		return wishes, err
	}

	if !s.UserCanViewWishlistByModel(userId, wishlist) {
		return wishes, apperror.NewError(apperror.NotFound, "Вишлист не найден")
	}

	wishes, err = s.WishRepository.ListForWishlist(wishlistUuid)
	return wishes, err

}

func (s *WishlistImpl) UserCanEditWishlist(userId int64, wishlistUuid string) bool {
	wishlist, err := s.GetByUUID(wishlistUuid)
	return err == nil && wishlist.UserId == userId
}

func (s *WishlistImpl) UserCanViewWishlistByModel(userId int64, wishlist *model.Wishlist) bool {
	if wishlist.Visible == model.Public {
		return true
	}

	return wishlist.UserId == userId

}

func (s *WishlistImpl) UserCanViewWishlistByUuid(userId int64, wishlistUuid string) bool {
	wishlist, err := s.GetByUUID(wishlistUuid)
	if err != nil {
		return false
	}
	return s.UserCanViewWishlistByModel(userId, wishlist)
}

func (s *WishlistImpl) DeleteWish(userId int64, wishUuid string) error {

	wish, err := s.WishRepository.Get(wishUuid)
	if err != nil || wish.UserId != userId {
		return errors.New("user can't get access to the wishlist")
	}

	return s.WishRepository.Delete(wishUuid)
}

func (s *WishlistImpl) RestoreWish(userId int64, wishUuid string) error {
	existWish, err := s.WishRepository.Get(wishUuid)
	if err != nil || existWish.UserId != userId {
		return errors.New("user can't update wish")
	}

	return s.WishRepository.Restore(wishUuid)
}

func (s *WishlistImpl) UpdateWish(userId int64, wish *model.Wish) (*model.Wish, error) {
	existWish, err := s.WishRepository.Get(wish.Uuid)
	if err != nil || existWish.UserId != userId {
		return nil, errors.New("user can't update wish")
	}

	return s.WishRepository.Update(wish)
}

func (s *WishlistImpl) GetWish(userId int64, wishUuid string) (*model.Wish, error) {

	existWish, err := s.WishRepository.Get(wishUuid)
	if err != nil || !s.UserCanViewWishlistByUuid(userId, existWish.WishlistUuid) {
		return nil, errors.New("user can't view wish")
	}
	return existWish, nil

}

func (s *WishlistImpl) ReserveWish(userId int64, wishUuid string) error {
	existWish, err := s.WishRepository.Get(wishUuid)
	if err != nil || !s.UserCanViewWishlistByUuid(userId, existWish.WishlistUuid) {
		return apperror.NewError(apperror.NotFound, "Желание не найдено")
	}
	if existWish.UserId == userId {
		return apperror.NewError(apperror.WrongRequest, "Вы не можете забронировать ваше желание")
	}
	if existWish.PresenterId.Valid {
		return apperror.NewError(apperror.WrongRequest, "Желание уже забронировано")
	}

	return s.WishRepository.SetPresenter(wishUuid, model.NullInt64{NullInt64: sql.NullInt64{Int64: userId, Valid: true}})
}

func (s *WishlistImpl) CancelWishReservation(userId int64, wishUuid string) error {
	existWish, err := s.WishRepository.Get(wishUuid)
	if err != nil {
		return err
	}
	if existWish.PresenterId.Int64 != userId {
		return apperror.NewError(apperror.WrongRequest, "Невозможно отменить бронь")
	}

	return s.WishRepository.SetPresenter(wishUuid, model.NullInt64{NullInt64: sql.NullInt64{}})

}

func (s *WishlistImpl) ReservedList(userId int64) (*[]model.Wish, error) {
	return s.WishRepository.ReservedList(userId)
}
