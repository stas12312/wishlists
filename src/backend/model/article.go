package model

import (
	"encoding/json"
	"time"
)

type Article struct {
	Id          int64           `json:"id"`
	Title       string          `json:"title"`
	Slug        string          `json:"slug"`
	CreatedAt   time.Time       `json:"created_at" db:"created_at"`
	PublishedAt NullTime        `json:"published_at" db:"published_at"`
	Description string          `json:"description"`
	Content     json.RawMessage `json:"content"`
	Image       string          `json:"image"`
	IsPublished bool            `json:"is_published" db:"is_published"`
}

type ArticleFilter struct {
	IsPublished bool
}
