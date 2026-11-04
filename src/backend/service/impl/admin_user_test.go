package impl

import (
	"errors"
	apperror "main/error"
	"main/repository"
	"testing"
)

type adminLinksStub struct {
	repository.AdminUserRepository
	deleted bool
	err     error
	calls   int
}

func (s *adminLinksStub) DeleteLink(id int64, provider, externalID string) (bool, error) {
	s.calls++
	return s.deleted, s.err
}

func TestAdminDeleteUserLink(t *testing.T) {
	for _, tc := range []struct {
		name       string
		provider   string
		externalID string
		deleted    bool
		dbErr      error
		wantCode   int
		wantCalls  int
	}{
		{name: "telegram", provider: "telegram", externalID: "123", deleted: true, wantCalls: 1},
		{name: "yandex", provider: "yandex", externalID: "123", deleted: true, wantCalls: 1},
		{name: "unknown provider", provider: "other", externalID: "123", wantCode: apperror.ValidateError},
		{name: "empty identity", provider: "telegram", wantCode: apperror.ValidateError},
		{name: "missing or belongs to another user", provider: "telegram", externalID: "123", wantCode: apperror.NotFound, wantCalls: 1},
		{name: "database failure", provider: "telegram", externalID: "123", dbErr: errors.New("private database details"), wantCode: apperror.DatabaseError, wantCalls: 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			repo := &adminLinksStub{deleted: tc.deleted, err: tc.dbErr}
			err := NewAdminUserService(repo).DeleteLink(42, tc.provider, tc.externalID)
			if tc.wantCode == 0 {
				if err != nil {
					t.Fatal(err)
				}
			} else {
				var appErr *apperror.Error
				if !errors.As(err, &appErr) || appErr.Code != tc.wantCode {
					t.Fatalf("unexpected error: %v", err)
				}
				if appErr.Message == "private database details" {
					t.Fatal("database details exposed")
				}
			}
			if repo.calls != tc.wantCalls {
				t.Fatalf("delete calls: %d, want %d", repo.calls, tc.wantCalls)
			}
		})
	}
}
