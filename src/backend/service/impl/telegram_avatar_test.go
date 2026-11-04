package impl

import (
	"context"
	"database/sql"
	"io"
	"main/model"
	"main/repository"
	"main/repository/mocks"
	"main/service"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/mock"
)

type avatarImageService struct {
	service.ImageService
	repository.ImageRepository
	data string
}

func (s *avatarImageService) Upload(filename string, file io.Reader) (string, error) {
	data, err := io.ReadAll(file)
	s.data = string(data)
	return "https://storage.local/images/avatar.jpg", err
}

func (s *avatarImageService) UploadByURL(rawURL string) (string, error) {
	images := &ImageServiceImpl{ImageRepository: s, UUIDGenerator: func() string { return "avatar" }, MaxDownloadSize: 5242880}
	return images.UploadByURL(rawURL)
}

type avatarTransport func(*http.Request) (*http.Response, error)

func (f avatarTransport) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

func TestTelegramExistingAccountDoesNotImportAvatar(t *testing.T) {
	for _, action := range []string{"login", "link", "register linked"} {
		t.Run(action, func(t *testing.T) {
			original := http.DefaultTransport
			t.Cleanup(func() { http.DefaultTransport = original })
			http.DefaultTransport = avatarTransport(func(r *http.Request) (*http.Response, error) {
				t.Fatal("existing account avatar must not be downloaded")
				return nil, nil
			})
			raw, now := telegramTestInitData(`{"id":123,"photo_url":"https://telegram.org/avatar.jpg"}`)
			links := mocks.NewOAuthUserRepository(t)
			users := mocks.NewUserRepository(t)
			links.On("Get", "telegram", "123").Return(&model.OAuthUser{UserId: 42}, nil).Once()
			users.On("GetById", int64(42)).Return(&model.User{Id: 42, IsActive: true}, nil).Once()
			s := telegramService{work: telegramTestWork{telegramTestStore{links: links, users: users}}, images: &avatarImageService{}, botToken: "test-token", now: func() time.Time { return now }}
			var err error
			switch action {
			case "login":
				_, err = s.Authenticate(context.Background(), raw)
			case "link":
				_, err = s.Link(context.Background(), 42, raw)
			default:
				_, err = s.Register(context.Background(), raw)
			}
			if err != nil {
				t.Fatal(err)
			}
		})
	}
}

func TestTelegramAvatar(t *testing.T) {
	for _, tc := range []struct {
		name       string
		existing   string
		status     int
		wantUpload bool
	}{
		{name: "save to storage", status: http.StatusOK, wantUpload: true},
		{name: "keep existing avatar", existing: "custom-avatar", status: http.StatusOK},
		{name: "download failure does not prevent login", status: http.StatusNotFound},
	} {
		t.Run(tc.name, func(t *testing.T) {
			original := http.DefaultTransport
			t.Cleanup(func() { http.DefaultTransport = original })
			http.DefaultTransport = avatarTransport(func(r *http.Request) (*http.Response, error) {
				if tc.existing != "" {
					t.Fatal("existing avatar must not be downloaded")
				}
				return &http.Response{StatusCode: tc.status, Body: io.NopCloser(strings.NewReader("avatar bytes")), Header: make(http.Header)}, nil
			})
			raw, now := telegramTestInitData(`{"id":123,"photo_url":"https://telegram.org/avatar.jpg"}`)
			links := mocks.NewOAuthUserRepository(t)
			users := mocks.NewUserRepository(t)
			user := &model.User{Id: 42, IsActive: true, Image: tc.existing}
			if tc.existing != "" {
				links.On("Get", "telegram", "123").Return(&model.OAuthUser{UserId: 42}, nil).Once()
				users.On("GetById", int64(42)).Return(user, nil).Once()
			} else {
				links.On("Get", "telegram", "123").Return((*model.OAuthUser)(nil), sql.ErrNoRows).Once()
				users.On("Create", "", "", "Пользователь Telegram", true, "", model.NullDate{}).Return(user, nil).Once()
				links.On("Create", &model.OAuthUser{Provider: "telegram", OAuthUserId: "123", UserId: 42}).Return(nil).Once()
			}
			if tc.wantUpload {
				users.On("GetById", int64(42)).Return(user, nil).Once()
				users.On("Update", mock.MatchedBy(func(u *model.User) bool { return u.Image == "https://storage.local/images/avatar.jpg" })).Return(user, nil).Once()
			}
			images := &avatarImageService{}
			s := telegramService{work: telegramTestWork{telegramTestStore{links: links, users: users}}, images: images, botToken: "test-token", now: func() time.Time { return now }}
			var got *model.User
			var err error
			if tc.existing != "" {
				got, err = s.Authenticate(context.Background(), raw)
			} else {
				got, err = s.Register(context.Background(), raw)
			}
			if err != nil || got == nil {
				t.Fatalf("login failed: %v", err)
			}
			if tc.wantUpload {
				if images.data != "avatar bytes" || got.Image != "https://storage.local/images/avatar.jpg" {
					t.Fatal("avatar was not copied to storage")
				}
			} else if got.Image != tc.existing || images.data != "" {
				t.Fatal("avatar unexpectedly changed")
			}
		})
	}
}
