package repository

import "main/model"

type AdminUserRepository interface {
	ListWishlists(id int64, offset int) ([]model.AdminUserWishlist, error)
	SetWishlistType(id int64, uuid string, forOther bool) error
	List(search string, before int64, count int) ([]model.AdminUser, error)
	Get(id int64) (*model.AdminUser, error)
	ListLinks(id int64) ([]model.OAuthUser, error)
	DeleteLink(id int64, provider, externalID string) (bool, error)
}
