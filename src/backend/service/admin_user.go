package service

import "main/model"

type AdminUserService interface {
	ListWishlists(id int64, offset int) ([]model.AdminUserWishlist, error)
	SetWishlistType(id int64, uuid string, forOther bool) error
	List(search string, before int64, count int) ([]model.AdminUser, error)
	Get(id int64) (*model.AdminUserDetail, error)
	DeleteLink(id int64, provider, externalID string) error
}
