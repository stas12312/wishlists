package model

type User struct {
	Id        int64    `json:"id" db:"user_id"`
	Email     string   `json:"email"`
	Name      string   `json:"name"`
	Password  string   `json:"-"`
	IsActive  bool     `json:"-" db:"is_active"`
	Username  string   `json:"username" db:"username"`
	Image     string   `json:"image" db:"image"`
	CreatedAt string   `json:"-" db:"created_at"`
	Birthday  NullDate `json:"birthday" db:"birthday"`
}

type UserForUpdate struct {
	Id       int64
	Name     string   `json:"name" validate:"required,min=2,max=50"`
	Username string   `json:"username" validate:"required,min=3,max=50,username-symbols"`
	Image    string   `json:"image"`
	Birthday NullDate `json:"birthday" db:"birthday"`
}

type UserShort struct {
	Id       int64    `json:"id" db:"user_id"`
	Name     string   `json:"name" db:"name"`
	Birthday NullDate `json:"birthday" db:"birthday"`
}

type TokenPariResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type AuthInfo struct {
	HasPassword bool `json:"has_password"`
}
