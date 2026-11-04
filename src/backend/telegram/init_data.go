package telegram

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"
)

var ErrInvalidInitData = errors.New("invalid Telegram init data")

type User struct {
	PhotoURL  string `json:"photo_url"`
	ID        int64  `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Username  string `json:"username"`
}

// Исходные данные и токен бота нельзя записывать в логи: они позволяют выдать себя за пользователя.
func ValidateInitData(raw, botToken string, now time.Time, maxAge time.Duration) (*User, error) {
	if botToken == "" || maxAge <= 0 {
		return nil, ErrInvalidInitData
	}
	values, err := url.ParseQuery(raw)
	if err != nil {
		return nil, ErrInvalidInitData
	}
	fields := make([]string, 0, len(values))
	for key, entries := range values {
		if key == "" || len(entries) != 1 || strings.ContainsAny(key, "\r\n=") {
			return nil, ErrInvalidInitData
		}
		if key != "hash" {
			fields = append(fields, key+"="+entries[0])
		}
	}
	receivedHash, err := hex.DecodeString(values.Get("hash"))
	if err != nil || len(receivedHash) != sha256.Size {
		return nil, ErrInvalidInitData
	}
	sort.Strings(fields)
	secret := hmac.New(sha256.New, []byte("WebAppData"))
	secret.Write([]byte(botToken))
	signature := hmac.New(sha256.New, secret.Sum(nil))
	signature.Write([]byte(strings.Join(fields, "\n")))
	if !hmac.Equal(receivedHash, signature.Sum(nil)) {
		return nil, ErrInvalidInitData
	}
	authDate, err := strconv.ParseInt(values.Get("auth_date"), 10, 64)
	if err != nil || authDate <= 0 || authDate > now.Unix() {
		return nil, ErrInvalidInitData
	}
	if time.Unix(authDate, 0).Before(now.Add(-maxAge)) {
		return nil, ErrInvalidInitData
	}
	var user User
	if err := json.Unmarshal([]byte(values.Get("user")), &user); err != nil || user.ID <= 0 {
		return nil, ErrInvalidInitData
	}
	return &user, nil
}
