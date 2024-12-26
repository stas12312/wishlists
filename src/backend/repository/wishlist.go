package repository

import "main/model"

//go:generate mockery --name WishlistRepository

type WishlistRepository interface {
	Create(wishlist *model.Wishlist) (*model.Wishlist, error)
	List(userId int64, filter model.WishlistFilter) ([]model.Wishlist, error)
	GetByUUID(uuid string) (*model.Wishlist, error)
	Update(wishlist *model.Wishlist) (*model.Wishlist, error)
	Delete(uuid string) error
	Restore(uuid string) error
}
