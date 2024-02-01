package model

import (
	"database/sql"
	"strings"
)

import (
	"fmt"
	"time"
)

type NullTime struct {
	sql.NullTime
}

type Wishlist struct {
	Uuid        string   `json:"uuid" db:"wishlist_uuid"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	CreatedAt   string   `json:"created_at" db:"created_at"`
	Date        NullTime `json:"date"`
	UserId      int64    `json:"user_id" db:"user_id"`
	IsActive    bool     `json:"is_active" db:"is_active"`
}

func (nt *NullTime) MarshalJSON() ([]byte, error) {
	if !nt.Valid {
		return []byte("null"), nil
	}
	val := fmt.Sprintf("\"%s\"", nt.Time.Format(time.RFC3339))
	return []byte(val), nil
}

func (nt *NullTime) UnmarshalJSON(b []byte) error {
	s := strings.ReplaceAll(string(b), "\"", "")

	x, err := time.Parse(time.RFC3339, s)
	if err != nil {
		nt.Valid = false
		return err
	}

	nt.Time = x
	nt.Valid = true
	return nil
}
