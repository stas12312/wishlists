package service

import (
	"main/model"
)

type WishlistService interface {
	Create(wishlist *model.Wishlist) (*model.Wishlist, error)
	DeleteWishlist(userId int64, wishlistUuid string) error
	RestoreWishlist(userId int64, wishlistUuid string) error
	ListForUser(userId int64, filter model.WishlistFilter, navigation model.Navigation) ([]model.Wishlist, error)
	GetForUserByUUID(userId int64, uuid string) (*model.Wishlist, error)
	UpdateForUser(userId int64, wishlist *model.Wishlist) (*model.Wishlist, error)
	AddWish(userId int64, wish *model.Wish) (*model.Wish, error)
	ListWishesForWishlist(userId int64, wishlistUuid string) (*[]model.Wish, error)
	DeleteWish(userId int64, wishUuid string) error
	RestoreWish(userId int64, wishUuid string) error
	UpdateWish(userId int64, wish *model.Wish) (*model.Wish, error)
	GetWish(userId int64, wishUuid string) (*model.Wish, error)
	ReserveWish(userId int64, wishUuid string) error
	CancelWishReservation(userId int64, wishUuid string) error
	ReservedList(userId int64) (*[]model.Wish, error)
	MakeWishFull(userId int64, wishUuid string) error
	CancelWishFull(userId int64, wishUuid string) error
	MoveWish(userId int64, wishUuid string, wishlistUuid string) (*model.Wish, error)
}
