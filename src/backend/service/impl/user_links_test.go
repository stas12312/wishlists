package impl

import (
	"context"
	"main/config"
	"main/model"
	"main/oauth"
	"main/repository/mocks"
	"testing"
)

func TestDeleteOAuthLinkRequiresEmail(t *testing.T) {
	for _, email := range []string{"", "   ", "user@example.com"} {
		t.Run(email, func(t *testing.T) {
			users := new(mocks.UserRepository)
			links := new(mocks.OAuthUserRepository)
			users.On("GetById", int64(42)).Return(&model.User{Id: 42, Email: email}, nil).Once()
			if email == "user@example.com" {
				links.On("DeleteByUserId", int64(42), "telegram").Return(nil).Once()
			}
			s := userServiceImpl{UnitOfWork: telegramTestWork{telegramTestStore{users: users, links: links}}}
			err := s.DeleteOAuthLink(context.Background(), 42, "telegram")
			if (err == nil) != (email == "user@example.com") {
				t.Fatalf("unexpected result: %v", err)
			}
			users.AssertExpectations(t)
			links.AssertExpectations(t)
		})
	}
}

func TestGetAuthInfoTelegramUsesBotDeepLink(t *testing.T) {
	users := new(mocks.UserRepository)
	links := new(mocks.OAuthUserRepository)
	users.On("GetById", int64(42)).Return(&model.User{Id: 42}, nil).Once()
	links.On("ListByUserId", int64(42)).Return([]model.OAuthUser{}, nil).Once()
	s := userServiceImpl{
		UnitOfWork: telegramTestWork{telegramTestStore{users: users, links: links}},
		Config:     &config.Config{TelegramBotUsername: "@my_wishlists_bot"},
	}
	info, err := s.GetAuthInfo(context.Background(), 42)
	if err != nil {
		t.Fatal(err)
	}
	if len(info.Providers) != 1 || info.Providers[0].URL != "https://t.me/my_wishlists_bot?start=auth" {
		t.Fatalf("unexpected providers: %+v", info.Providers)
	}
	users.AssertExpectations(t)
	links.AssertExpectations(t)
}

func TestListOAuthProvidersIncludesTelegram(t *testing.T) {
	s := userServiceImpl{
		Manager: oauth.NewManager(),
		Config:  &config.Config{TelegramBotUsername: "@my_wishlists_bot"},
	}
	providers := s.ListOAuthProviders(context.Background())
	if len(providers) != 1 || providers[0].Name != "TELEGRAM" || providers[0].Url != "https://t.me/my_wishlists_bot?start=auth" {
		t.Fatalf("unexpected providers: %+v", providers)
	}
}
