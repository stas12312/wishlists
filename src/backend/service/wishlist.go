package service

import "main/model"

type WishlistService interface {
	Create(wishlist *model.Wishlist) (*model.Wishlist, error)
	ListForUser(userId int64) ([]model.Wishlist, error)
	GetForUserByUUID(userId int64, uuid string) (*model.Wishlist, error)
	UpdateForUser(userId int64, wishlist *model.Wishlist) (*model.Wishlist, error)
}
