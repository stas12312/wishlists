package telegram

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"testing"
	"time"
)

func signedData(values url.Values, token string) string {
	keys := make([]string, 0, len(values))
	for key := range values {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	lines := make([]string, 0, len(keys))
	for _, key := range keys {
		lines = append(lines, key+"="+values.Get(key))
	}
	secret := hmac.New(sha256.New, []byte("WebAppData"))
	secret.Write([]byte(token))
	mac := hmac.New(sha256.New, secret.Sum(nil))
	mac.Write([]byte(strings.Join(lines, "\n")))
	values.Set("hash", hex.EncodeToString(mac.Sum(nil)))
	return values.Encode()
}

func TestValidateInitData(t *testing.T) {
	now := time.Unix(1800000000, 0)
	const token = "test-bot-token"
	for _, tc := range []struct {
		name    string
		date    int64
		user    string
		mutate  func(string) string
		invalid bool
	}{
		{name: "valid", date: now.Unix()},
		{name: "expired", date: now.Add(-6 * time.Minute).Unix(), invalid: true},
		{name: "future", date: now.Add(time.Second).Unix(), invalid: true},
		{name: "missing user", date: now.Unix(), user: "null", invalid: true},
		{name: "invalid user", date: now.Unix(), user: "{", invalid: true},
		{name: "zero ID", date: now.Unix(), user: `{"id":0}`, invalid: true},
		{name: "tampered", date: now.Unix(), mutate: func(raw string) string {
			return strings.Replace(raw, "query_id=original", "query_id=changed", 1)
		}, invalid: true},
		{name: "duplicate", date: now.Unix(), mutate: func(raw string) string {
			return raw + "&user=%7B%22id%22%3A1%7D"
		}, invalid: true},
		{name: "malformed encoding", date: now.Unix(), mutate: func(raw string) string {
			return raw + "&extra=%ZZ"
		}, invalid: true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			userJSON := tc.user
			if userJSON == "" {
				userJSON = `{"id":900719925474,"first_name":"Тест + &","username":"tester"}`
			}
			raw := signedData(url.Values{
				"auth_date": {strconv.FormatInt(tc.date, 10)},
				"user":      {userJSON}, "query_id": {"original"}, "signature": {"telegram-signature"},
			}, token)
			if tc.mutate != nil {
				raw = tc.mutate(raw)
			}
			user, err := ValidateInitData(raw, token, now, 5*time.Minute)
			if tc.invalid {
				if !errors.Is(err, ErrInvalidInitData) || user != nil {
					t.Fatalf("expected rejection, got user=%v err=%v", user, err)
				}
				return
			}
			if err != nil || user.ID != 900719925474 || user.FirstName != "Тест + &" {
				t.Fatalf("unexpected user=%v err=%v", user, err)
			}
			for _, badToken := range []string{"", "wrong-token"} {
				if _, err := ValidateInitData(raw, badToken, now, 5*time.Minute); !errors.Is(err, ErrInvalidInitData) {
					t.Fatal("accepted invalid token")
				}
			}
		})
	}
}
