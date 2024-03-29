package model

type Wish struct {
	Uuid         string     `json:"uuid" db:"wish_uuid"`
	Name         string     `json:"name" validate:"required"`
	Comment      NullString `json:"comment"`
	Link         NullString `json:"link"`
	WishlistUuid string     `json:"wishlist_uuid" db:"wishlist_uuid" validate:"required"`
	Image        NullString `json:"image"`
	Desirability NullInt32  `json:"desirability"`
	CreatedAt    NullTime   `json:"created_at" db:"created_at"`
	FulfilledAt  NullTime   `json:"fulfilled_at" db:"fulfilled_at"`
	Cost         float64    `json:"cost"`
	IsActive     bool       `json:"is_active" db:"is_active"`
	UserId       int64      `json:"user_id" db:"user_id"`
}
