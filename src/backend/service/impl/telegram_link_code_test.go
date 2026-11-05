package impl

import (
	"context"
	"errors"
	apperror "main/error"
	"main/model"
	"main/repository/mocks"
	"net/url"
	"strings"
	"testing"

	"github.com/stretchr/testify/mock"
)

func TestTelegramCreateLinkCode(t *testing.T) {
	codes := mocks.NewCodeRepository(t)
	var saved *model.Code
	codes.On("Create", mock.Anything).
		Run(func(args mock.Arguments) { saved = args.Get(0).(*model.Code) }).
		Return((*model.Code)(nil), nil).Once()
	s := telegramService{codes: codes, botUsername: "@my_wishlists_bot"}

	link, err := s.CreateLinkCode(context.Background(), 42)
	if err != nil {
		t.Fatal(err)
	}
	if saved == nil || saved.UserId != 42 || saved.CodeType != model.TelegramLinkCode || saved.AttemptsCount != 1 {
		t.Fatalf("unexpected code: %+v", saved)
	}
	parsed, err := url.Parse(link)
	if err != nil {
		t.Fatal(err)
	}
	if parsed.Scheme != "https" || parsed.Host != "t.me" || parsed.Path != "/my_wishlists_bot" {
		t.Fatalf("unexpected link: %s", link)
	}
	if payload := parsed.Query().Get("start"); payload != "link_"+saved.UUID+"_"+saved.Key {
		t.Fatalf("unexpected payload: %q", payload)
	}
}

func TestTelegramCreateLinkCodeRejectsInvalidRequest(t *testing.T) {
	for _, tc := range []struct {
		name        string
		userID      int64
		botUsername string
	}{
		{name: "anonymous", botUsername: "bot"},
		{name: "missing bot", userID: 42},
	} {
		t.Run(tc.name, func(t *testing.T) {
			s := telegramService{botUsername: tc.botUsername}
			link, err := s.CreateLinkCode(context.Background(), tc.userID)
			var appErr *apperror.Error
			if link != "" || !strings.Contains(err.Error(), "Telegram") || !errors.As(err, &appErr) {
				t.Fatalf("unexpected link=%q err=%v", link, err)
			}
		})
	}
}
