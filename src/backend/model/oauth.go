package model

type OAuthUser struct {
	Provider    string `json:"provider" db:"provider"`
	OAuthUserId string `json:"oauth_user_id" db:"oauth_user_id"`
	UserId      int64  `json:"user_id" db:"user_id"`
}
