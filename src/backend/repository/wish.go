package repository

import "main/model"

//go:generate mockery --name WishRepository

type WishRepository interface {
	Create(wish *model.Wish) (*model.Wish, error)
	Update(wish *model.Wish) (*model.Wish, error)
	Get(wishUuid string) (*model.Wish, error)
	ListForWishlist(wishlistUuid string) (*[]model.Wish, error)
	Delete(wishUuid string) error
	Restore(wishUuid string) error
}
