package impl

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	apperror "main/error"
	"main/model"
	"main/repository"
	"main/service"
	"time"
)

func NewWishlistService(
	wlRepository repository.WishlistRepository,
	wRepository repository.WishRepository,
	uService service.UserService,
	fService service.FriendService,
	wsService service.WSService,
) service.WishlistService {
	return &WishlistImpl{
		wlRepository,
		wRepository,
		uService,
		fService,
		wsService,
	}
}

type WishlistImpl struct {
	repository.WishlistRepository
	repository.WishRepository
	service.UserService
	service.FriendService
	service.WSService
}

func (s *WishlistImpl) Create(wishlist *model.Wishlist) (*model.Wishlist, error) {
	return s.WishlistRepository.Create(wishlist)
}

func (s *WishlistImpl) ListForUser(
	userId int64,
	filter model.WishlistFilter,
	navigation model.Navigation,
) ([]model.Wishlist, error) {
	if filter.Username != "" {
		user, err := s.UserService.GetByUsername(context.Background(), filter.Username)
		if err != nil {
			filter.UserId = 0
		} else {
			filter.UserId = user.Id
		}
	}
	filter.IsFriend = s.IsFriends(userId, filter.UserId)
	return s.WishlistRepository.List(userId, filter, navigation)
}

func (s *WishlistImpl) GetForUserByUUID(userId int64, uuid string) (*model.Wishlist, error) {
	wishlist, err := s.WishlistRepository.GetByUUID(uuid)
	if err != nil {
		return nil, err
	}

	wishlist.User, _ = s.GetById(context.Background(), wishlist.UserId)
	wishlist.User.Email = ""

	if s.UserCanViewWishlistByModel(userId, wishlist) {
		return wishlist, nil
	} else {
		return nil, apperror.NewError(apperror.NotFound, "Вишлист не найден")
	}
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
	return s.GetForUserByUUID(userId, wishlist.Uuid)
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
	if err != nil {
		return nil, err
	}
	wish.UserId = userId
	preparedWish := prepareWish(userId, *wish)
	s.WSService.SendMessageToChannel(getChannelNameForWishlist(wish.WishlistUuid), model.WSMessage{Event: service.Update})
	return &preparedWish, nil
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
	prepareWishes(userId, wishes)
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

	if wishlist.Visible == model.ForFriends && s.FriendService.IsFriends(userId, wishlist.UserId) {
		return true
	}
	if wishlist.Visible == model.ForSelectedFriends && userHasAccess(userId, wishlist.VisibleUserIds) {
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

	err = s.WishRepository.Delete(wishUuid)
	if err != nil {
		return err
	}
	s.WSService.SendMessageToChannel(getChannelNameForWishlist(wish.WishlistUuid), model.WSMessage{Event: service.Update})
	return nil
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
	wish.WishlistUuid = existWish.WishlistUuid
	updatedWish, err := s.WishRepository.Update(wish)
	if err != nil {
		return nil, apperror.NewError(apperror.WrongRequest, "Не удалось обновить желание")
	}
	preparedWish := prepareWish(userId, *updatedWish)
	s.WSService.SendMessageToChannel(getChannelNameForWishlist(existWish.WishlistUuid), model.WSMessage{Event: service.Update})
	return &preparedWish, nil
}

func (s *WishlistImpl) GetWish(userId int64, wishUuid string) (*model.Wish, error) {

	existWish, err := s.WishRepository.Get(wishUuid)
	if err != nil || !s.UserCanViewWishlistByUuid(userId, existWish.WishlistUuid) {
		return nil, apperror.NewError(apperror.NotFound, "Желание не найдено")
	}
	preparedWish := prepareWish(userId, *existWish)
	return &preparedWish, nil

}

func (s *WishlistImpl) ReserveWish(userId int64, wishUuid string) error {
	existWish, err := s.WishRepository.Get(wishUuid)
	if err != nil || !s.UserCanViewWishlistByUuid(userId, existWish.WishlistUuid) {
		return apperror.NewError(apperror.NotFound, "Желание не найдено")
	}
	if existWish.UserId == userId {
		return apperror.NewError(apperror.WrongRequest, "Вы не можете забронировать ваше желание")
	}
	if existWish.FulfilledAt.Valid {
		return apperror.NewError(apperror.WrongRequest, "Вы не можете забронировать исполненное желание")
	}
	if existWish.PresenterId.Valid {
		return apperror.NewError(apperror.WrongRequest, "Желание уже забронировано")
	}

	err = s.WishRepository.SetPresenter(wishUuid, model.NullInt64{NullInt64: sql.NullInt64{Int64: userId, Valid: true}})
	if err != nil {
		return err
	}
	s.WSService.SendMessageToChannel(getChannelNameForWishlist(existWish.WishlistUuid), model.WSMessage{Event: service.Update})
	return nil
}

func (s *WishlistImpl) CancelWishReservation(userId int64, wishUuid string) error {
	existWish, err := s.WishRepository.Get(wishUuid)
	if err != nil {
		return err
	}
	if existWish.PresenterId.Int64 != userId {
		return apperror.NewError(apperror.WrongRequest, "Невозможно отменить бронь")
	}

	err = s.WishRepository.SetPresenter(wishUuid, model.NullInt64{NullInt64: sql.NullInt64{}})
	if err != nil {
		return err
	}
	s.WSService.SendMessageToChannel(getChannelNameForWishlist(existWish.WishlistUuid), model.WSMessage{Event: service.Update})
	return nil
}

func (s *WishlistImpl) MakeWishFull(userId int64, wishUuid string) error {
	existWish, err := s.WishRepository.Get(wishUuid)
	if err != nil {
		return err
	}
	if existWish.UserId != userId || existWish.FulfilledAt.Valid {
		return apperror.NewError(apperror.WrongRequest, "Невозможно отметить желание исполненным")
	}
	err = s.WishRepository.SetFulfilledAt(
		wishUuid,
		model.NullTime{NullTime: sql.NullTime{Time: time.Now().UTC(), Valid: true}},
	)
	if err != nil {
		return err
	}
	s.WSService.SendMessageToChannel(getChannelNameForWishlist(existWish.WishlistUuid), model.WSMessage{Event: service.Update})
	return nil
}

func (s *WishlistImpl) CancelWishFull(userId int64, wishUuid string) error {
	existWish, err := s.WishRepository.Get(wishUuid)
	if err != nil {
		return err
	}
	if existWish.UserId != userId || !existWish.FulfilledAt.Valid {
		return apperror.NewError(apperror.WrongRequest, "Невозможно отметить желание исполненным")
	}
	err = s.WishRepository.SetFulfilledAt(wishUuid, model.NullTime{})
	if err != nil {
		return err
	}
	s.WSService.SendMessageToChannel(getChannelNameForWishlist(existWish.WishlistUuid), model.WSMessage{Event: service.Update})
	return nil
}

func (s *WishlistImpl) ReservedList(userId int64) (*[]model.Wish, error) {
	wishes, err := s.WishRepository.ReservedList(userId)
	if err != nil {
		return wishes, apperror.NewError(apperror.NotFound, "Не удалось получить желания")
	}
	prepareWishes(userId, wishes)
	return wishes, err
}

func (s *WishlistImpl) MoveWish(userId int64, wishUuid string, wishlistUuid string) (*model.Wish, error) {
	wish, err := s.GetWish(userId, wishUuid)
	if err != nil || wish.UserId != userId {
		return nil, apperror.NewError(apperror.NotFound, "Желание не найдено или недоступно для редактирования")
	}

	if !s.UserCanEditWishlist(userId, wishlistUuid) {
		return nil, apperror.NewError(apperror.NotFound, "Вишлист не найден или недоступен")
	}
	oldWishlistUuid := wish.WishlistUuid
	wish.WishlistUuid = wishlistUuid
	movedWish, err := s.WishRepository.Update(wish)
	if err != nil {
		return nil, apperror.NewError(apperror.WrongRequest, err.Error())
	}
	preparedWish := prepareWish(userId, *movedWish)
	s.WSService.SendMessageToChannel(getChannelNameForWishlist(oldWishlistUuid), model.WSMessage{Event: service.Update})
	return &preparedWish, nil
}

func (s *WishlistImpl) CopyWish(userId int64, wishUuid string, toWishlistUuid string) (*model.Wish, error) {
	wish, err := s.GetWish(userId, wishUuid)
	if err != nil {
		return nil, apperror.NewError(apperror.NotFound, "Желание не найдено или недоступно для просмотра")
	}

	newWish := &model.Wish{
		UserId:       userId,
		WishlistUuid: toWishlistUuid,
		Name:         wish.Name,
		Comment:      wish.Comment,
		Images:       wish.Images,
		Link:         wish.Link,
		Desirability: wish.Desirability,
		Cost:         wish.Cost,
		Currency:     wish.Currency,
	}
	savedWish, err := s.AddWish(userId, newWish)
	if err != nil {
		return nil, apperror.NewError(apperror.WrongRequest, err.Error())
	}
	return savedWish, err
}

func getActionsForWish(userId int64, wish model.Wish) model.WishActions {
	userIsOwner := userId == wish.UserId
	return model.WishActions{
		Edit:          userIsOwner,
		Reserve:       userId > 0 && !wish.PresenterId.Valid && wish.UserId != userId && !wish.FulfilledAt.Valid,
		CancelReserve: wish.PresenterId.Valid && wish.PresenterId.Int64 == userId,
		MakeFull:      userIsOwner && !wish.FulfilledAt.Valid,
		CancelFull:    userIsOwner && wish.FulfilledAt.Valid,
	}
}

func prepareWish(userId int64, wish model.Wish) model.Wish {
	wish.Actions = getActionsForWish(userId, wish)

	if wish.UserId == userId || userId == 0 {
		wish.IsReserved = false
	}
	return wish
}

func prepareWishes(userId int64, wishes *[]model.Wish) {
	for i := range *wishes {
		(*wishes)[i] = prepareWish(userId, (*wishes)[i])
	}
}

func userHasAccess(userId int64, userIds model.Int64Array) bool {
	for _, value := range userIds.Values() {
		if value == userId {
			return true
		}
	}

	return false
}

func getChannelNameForWishlist(wishlistUuid string) string {
	return fmt.Sprintf("wishlist_%s", wishlistUuid)
}
