package impl

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	apperror "main/error"
	"main/model"
	"main/repository"
	"main/repository/mocks"
	"main/uof"
	"net/url"
	"testing"
	"time"
)

type telegramTestWork struct {
	uof.UnitOfWorkStore
}

func (w telegramTestWork) Do(ctx context.Context, fn func(context.Context, uof.UnitOfWorkStore) error) error {
	return fn(ctx, w.UnitOfWorkStore)
}

type telegramTestStore struct {
	uof.UnitOfWorkStore
	links repository.OAuthUserRepository
	users repository.UserRepository
}

func (s telegramTestStore) OAuthRepository() repository.OAuthUserRepository { return s.links }
func (s telegramTestStore) UserRepository() repository.UserRepository       { return s.users }

func telegramTestInitData(userJSON string) (string, time.Time) {
	now := time.Unix(1800000000, 0)
	const token = "test-token"
	secret := hmac.New(sha256.New, []byte("WebAppData"))
	secret.Write([]byte(token))
	mac := hmac.New(sha256.New, secret.Sum(nil))
	mac.Write([]byte("auth_date=1800000000\nuser=" + userJSON))
	raw := url.Values{
		"auth_date": {"1800000000"}, "user": {userJSON}, "hash": {hex.EncodeToString(mac.Sum(nil))},
	}.Encode()
	return raw, now
}

func TestTelegramAccountLink(t *testing.T) {
	raw, now := telegramTestInitData(`{"id":123}`)

	for _, owner := range []int64{0, 42, 99} {
		t.Run(map[int64]string{0: "new link", 42: "same owner", 99: "other owner"}[owner], func(t *testing.T) {
			links := mocks.NewOAuthUserRepository(t)
			users := mocks.NewUserRepository(t)
			users.On("GetById", int64(42)).Return(&model.User{Id: 42, IsActive: true}, nil).Once()
			if owner == 0 {
				links.On("Get", "telegram", "123").Return((*model.OAuthUser)(nil), sql.ErrNoRows).Once()
				links.On("Create", &model.OAuthUser{Provider: "telegram", OAuthUserId: "123", UserId: 42}).Return(nil).Once()
			} else {
				links.On("Get", "telegram", "123").Return(&model.OAuthUser{UserId: owner}, nil).Once()
			}
			s := telegramService{work: telegramTestWork{telegramTestStore{links: links, users: users}}, botToken: "test-token", now: func() time.Time { return now }}
			user, err := s.Link(context.Background(), 42, raw)
			if owner == 99 {
				var appErr *apperror.Error
				if user != nil || !errors.As(err, &appErr) || appErr.Code != apperror.OAuthError {
					t.Fatalf("expected conflict, got user=%v err=%v", user, err)
				}
			} else if err != nil || user == nil || user.Id != 42 {
				t.Fatalf("unexpected user=%v err=%v", user, err)
			}
			links.AssertNotCalled(t, "Update")
		})
	}
}

func TestTelegramRegister(t *testing.T) {
	for _, tc := range []struct {
		name     string
		username string
		occupied bool
	}{
		{name: "free username", username: "ivan"},
		{name: "occupied username", username: "ivan", occupied: true},
		{name: "no username"},
		{name: "invalid username", username: "invalid!"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			raw, now := telegramTestInitData(fmt.Sprintf(`{"id":123,"first_name":"Иван","username":%q}`, tc.username))
			links := mocks.NewOAuthUserRepository(t)
			users := mocks.NewUserRepository(t)
			links.On("Get", "telegram", "123").Return((*model.OAuthUser)(nil), sql.ErrNoRows).Once()
			if tc.username == "ivan" {
				if tc.occupied {
					users.On("GetByUsername", "ivan").Return(&model.User{Id: 99}, nil).Once()
				} else {
					users.On("GetByUsername", "ivan").Return((*model.User)(nil), sql.ErrNoRows).Once()
				}
			}
			created := &model.User{Id: 42, Name: "Иван", IsActive: true, Username: "a1b2c3d4e5f6"}
			users.On("Create", "", "", "Иван", true, "", model.NullDate{}).Return(created, nil).Once()
			expectedUsername := created.Username
			if tc.username == "ivan" && !tc.occupied {
				expectedUsername = "ivan"
				users.On("Update", &model.User{Id: 42, Name: "Иван", IsActive: true, Username: "ivan"}).Return(created, nil).Once()
			}
			links.On("Create", &model.OAuthUser{Provider: "telegram", OAuthUserId: "123", UserId: 42}).Return(nil).Once()
			s := telegramService{work: telegramTestWork{telegramTestStore{links: links, users: users}}, botToken: "test-token", now: func() time.Time { return now }}
			user, err := s.Register(context.Background(), raw)
			if err != nil || user == nil || user.Username != expectedUsername || !user.IsActive || user.Email != "" || user.Password != "" {
				t.Fatalf("unexpected user=%v err=%v", user, err)
			}
		})
	}
}

func TestTelegramRegisterAlreadyLinked(t *testing.T) {
	raw, now := telegramTestInitData(`{"id":123}`)
	links := mocks.NewOAuthUserRepository(t)
	users := mocks.NewUserRepository(t)
	links.On("Get", "telegram", "123").Return(&model.OAuthUser{UserId: 42}, nil).Once()
	users.On("GetById", int64(42)).Return(&model.User{Id: 42, IsActive: true}, nil).Once()
	s := telegramService{work: telegramTestWork{telegramTestStore{links: links, users: users}}, botToken: "test-token", now: func() time.Time { return now }}
	user, err := s.Register(context.Background(), raw)
	if err != nil || user == nil || user.Id != 42 {
		t.Fatalf("unexpected user=%v err=%v", user, err)
	}
}
