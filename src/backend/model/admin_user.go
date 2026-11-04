package model

type AdminUser struct {
	Id          int64  `json:"id" db:"user_id"`
	Name        string `json:"name" db:"name"`
	Username    string `json:"username" db:"username"`
	Email       string `json:"email" db:"email"`
	IsActive    bool   `json:"is_active" db:"is_active"`
	IsAdmin     bool   `json:"is_admin" db:"is_admin"`
	CreatedAt   string `json:"created_at" db:"created_at"`
	HasPassword bool   `json:"has_password" db:"has_password"`
}

type AdminUserDetail struct {
	AdminUser
	Links []OAuthUser `json:"links"`
}
