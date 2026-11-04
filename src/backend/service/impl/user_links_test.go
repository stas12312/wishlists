package impl

import (
	"context"
	"main/model"
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
