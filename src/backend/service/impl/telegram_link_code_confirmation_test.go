package impl

import (
	"context"
	"errors"
	apperror "main/error"
	"main/model"
	"main/repository/mocks"
	"strings"
	"testing"
	"time"
)

func TestTelegramLinkCodeRedeem(t *testing.T) {
	for _, consumed := range []bool{true, false} {
		t.Run(map[bool]string{true: "new session without linking", false: "already consumed"}[consumed], func(t *testing.T) {
			raw, now := telegramTestInitData(`{"id":123}`)
			code := &model.Code{UUID: "b6341c65-0a48-483c-a733-548b45972f08", Key: strings.Repeat("a", 22), UserId: 42, CodeType: model.TelegramLinkCode}
			codes := mocks.NewCodeRepository(t)
			codes.On("Get", code.UUID).Return(code, nil).Once()
			codes.On("Consume", code).Return(consumed, nil).Once()
			users := mocks.NewUserRepository(t)
			users.On("GetById", int64(42)).Return(&model.User{Id: 42, Name: "Иван Иванов", IsActive: true}, nil).Once()
			s := telegramService{work: telegramTestWork{telegramTestStore{users: users}}, codes: codes, botToken: "test-token", now: func() time.Time { return now }}
			user, err := s.RedeemLinkCode(context.Background(), raw, "link_"+code.UUID+"_"+code.Key)
			if consumed {
				if err != nil || user == nil || user.Id != 42 || user.Name != "Иван Иванов" {
					t.Fatalf("unexpected user=%+v err=%v", user, err)
				}
			} else {
				var appErr *apperror.Error
				if user != nil || !errors.As(err, &appErr) || appErr.Code != apperror.OAuthError {
					t.Fatalf("unexpected user=%+v err=%v", user, err)
				}
			}
		})
	}
}

func TestTelegramLinkCodeRejectsWrongKey(t *testing.T) {
	raw, now := telegramTestInitData(`{"id":123}`)
	code := &model.Code{UUID: "b6341c65-0a48-483c-a733-548b45972f08", Key: strings.Repeat("a", 22), UserId: 42, CodeType: model.TelegramLinkCode}
	codes := mocks.NewCodeRepository(t)
	codes.On("Get", code.UUID).Return(code, nil).Once()
	s := telegramService{codes: codes, botToken: "test-token", now: func() time.Time { return now }}
	user, err := s.RedeemLinkCode(context.Background(), raw, "link_"+code.UUID+"_"+strings.Repeat("b", 22))
	var appErr *apperror.Error
	if user != nil || !errors.As(err, &appErr) || appErr.Code != apperror.OAuthError {
		t.Fatalf("unexpected user=%+v err=%v", user, err)
	}
	codes.AssertNotCalled(t, "Consume", code)
}
