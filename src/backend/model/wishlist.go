package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

type WishlistVisible int

const (
	Private            WishlistVisible = 0
	Public             WishlistVisible = 1
	ForFriends         WishlistVisible = 2
	ForSelectedFriends WishlistVisible = 3
)

type WishlistSettings struct {
	ForOther bool   `json:"for_other"`
	Color    string `json:"color"`
	Emoji    string `json:"emoji"`
}

func (s WishlistSettings) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *WishlistSettings) Scan(src interface{}) error {
	switch v := src.(type) {
	case []byte:
		return json.Unmarshal(v, s)
	case string:
		return json.Unmarshal([]byte(v), s)
	}
	return errors.New("type assertion failed")
}

type Wishlist struct {
	Uuid           string           `json:"uuid" db:"wishlist_uuid"`
	Name           string           `json:"name" validate:"required"`
	Description    string           `json:"description"`
	CreatedAt      string           `json:"created_at" db:"created_at"`
	Date           NullTime         `json:"date" db:"date"`
	UserId         int64            `json:"user_id" db:"user_id"`
	IsActive       bool             `json:"is_active" db:"is_active"`
	WishesCount    NullInt32        `json:"wishes_count" db:"wishes_count"`
	Visible        WishlistVisible  `json:"visible" db:"visible" validate:"oneof=0 1 2 3"`
	Settings       WishlistSettings `json:"settings" db:"settings"`
	User           *User            `json:"user"`
	VisibleUsers   UserArray        `json:"visible_users" db:"visible_users"`
	VisibleUserIds Int64Array       `json:"visible_user_ids" db:"visible_user_ids"`
}

type WishlistShort struct {
	Name string   `json:"name" db:"name"`
	Date NullTime `json:"date" db:"date"`
}

type WishlistFilter struct {
	IsActive bool  `query:"is_active"`
	UserId   int64 `query:"user_id"`
	IsFriend bool
	Username string `query:"username"`
}
