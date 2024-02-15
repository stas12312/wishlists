package model

type User struct {
	Id       int64  `json:"id" db:"user_id"`
	Email    string `json:"email"`
	Name     string `json:"name"`
	Password string `json:"-"`
	IsActive bool   `json:"-" db:"is_active"`
}

type TokenPariResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}
