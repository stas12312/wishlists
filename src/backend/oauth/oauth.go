package oauth

type User struct {
	Id    string
	Email string
	Name  string
	Image string
}

type Config struct {
	ClientId     string `json:"client_id"`
	ClientSecret string
	Scopes       string `json:"scopes"`
	RedirectURI  string `json:"redirect_uri"`
	LogoURL      string `json:"logo_url"`
}

//go:generate mockery --name Client

type Client interface {
	GetUserInfo(token string) (*User, error)
	GetConfig() Config
	GetAuthUrl() string
	GetProvider() string
	GetLogoUrl() string
}
