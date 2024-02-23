package service

import (
	"main/model"
)

type WishlistService interface {
	Create(wishlist *model.Wishlist) (*model.Wishlist, error)
	DeleteWishlist(userId int64, wishlistUuid string) error
	ListForUser(userId int64) ([]model.Wishlist, error)
	GetForUserByUUID(userId int64, uuid string) (*model.Wishlist, error)
	UpdateForUser(userId int64, wishlist *model.Wishlist) (*model.Wishlist, error)
	AddWish(userId int64, wish *model.Wish) (*model.Wish, error)
	ListWishesForWishlist(userId int64, wishlistUuid string) (*[]model.Wish, error)
	DeleteWish(userId int64, wishUuid string) error
	UpdateWish(userId int64, wish *model.Wish) (*model.Wish, error)
}
