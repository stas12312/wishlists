package repository

import "main/model"

type WishlistRepository interface {
	Create(wishlist *model.Wishlist) (*model.Wishlist, error)
	ListByUserId(userId int64) ([]model.Wishlist, error)
	GetByUUID(uuid string) (*model.Wishlist, error)
	Update(wishlist *model.Wishlist) (*model.Wishlist, error)
}
