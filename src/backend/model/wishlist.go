package model

type WishlistVisible int

const (
	Private WishlistVisible = 0
	Public  WishlistVisible = 1
)

type Wishlist struct {
	Uuid        string          `json:"uuid" db:"wishlist_uuid"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	CreatedAt   string          `json:"created_at" db:"created_at"`
	Date        NullTime        `json:"date"`
	UserId      int64           `json:"user_id" db:"user_id"`
	IsActive    bool            `json:"is_active" db:"is_active"`
	WishesCount NullInt32       `json:"wishes_count" db:"wishes_count"`
	Visible     WishlistVisible `json:"visible" db:"visible" validate:"oneof=0 1 2"`
	User        *User           `json:"user"`
}

type WishlistFilter struct {
	IsActive bool  `query:"is_active"`
	UserId   int64 `query:"user_id"`
	IsFriend bool
}
