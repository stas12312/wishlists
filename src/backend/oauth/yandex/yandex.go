package yandex

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"main/oauth"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
)

const InfoUrl = "https://login.yandex.ru/info"
const TokenUrl = "https://oauth.yandex.ru/token"
const AuthUrl = "https://oauth.yandex.ru/authorize"

type User struct {
	Id        string `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"default_email"`
}

type Token struct {
	AccessToken string `json:"access_token"`
}

func NewYandexFromEnv() Client {
	return Client{
		config: oauth.Config{
			ClientId:     os.Getenv("OAUTH_YANDEX_CLIENT_ID"),
			ClientSecret: os.Getenv("OAUTH_YANDEX_CLIENT_SECRET"),
			RedirectURI:  os.Getenv("OAUTH_YANDEX_REDIRECT_URI"),
			LogoURL:      os.Getenv("OAUTH_YANDEX_LOGO_URL"),
		},
	}
}

type Client struct {
	config oauth.Config
}

func (c Client) GetAuthUrl() string {
	return fmt.Sprintf("%s?response_type=code&client_id=%s", AuthUrl, c.config.ClientId)
}

func (c Client) GetProvider() string {
	return "YANDEX"
}

func (c Client) GetUserInfo(token string) (*oauth.User, error) {

	client := http.Client{}
	token, err := c.GetTokenByCode(token)
	user := &oauth.User{}

	if err != nil {
		return user, err
	}

	request, _ := http.NewRequest(http.MethodGet, InfoUrl, nil)
	request.Header.Set("Authorization", fmt.Sprintf("OAuth %s", token))
	response, err := client.Do(request)
	if err != nil {
		return user, err
	}

	yandexUser := &User{}
	err = json.NewDecoder(response.Body).Decode(yandexUser)
	if err != nil {
		return user, err
	}

	user.Id = yandexUser.Id
	user.Name = fmt.Sprintf("%s %s", yandexUser.FirstName, yandexUser.LastName)
	user.Email = yandexUser.Email

	return user, nil
}

func (c Client) GetTokenByCode(code string) (string, error) {

	auth := fmt.Sprintf("%s:%s", c.config.ClientId, c.config.ClientSecret)
	authHeader := base64.StdEncoding.EncodeToString([]byte(auth))

	client := http.Client{}
	data := url.Values{"grant_type": {"authorization_code"}, "code": {code}}

	r, _ := http.NewRequest(http.MethodPost, TokenUrl, strings.NewReader(data.Encode()))
	r.Header.Add("Authorization", fmt.Sprintf("Basic %s", authHeader))
	r.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	r.Header.Add("Content-Length", strconv.Itoa(len(data.Encode())))
	response, err := client.Do(r)
	if err != nil {
		return "", nil
	}
	if response.StatusCode == http.StatusBadRequest {
		buf := new(bytes.Buffer)
		_, err = buf.ReadFrom(response.Body)
		if err != nil {
			return "", err
		}
		return "", errors.New(buf.String())
	}

	token := &Token{}
	err = json.NewDecoder(response.Body).Decode(token)
	return token.AccessToken, err
}

func (c Client) GetLogoUrl() string {
	return c.config.LogoURL
}

func (c Client) GetConfig() oauth.Config {
	return c.config
}
