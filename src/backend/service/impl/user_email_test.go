package impl

import (
	"context"
	"database/sql"
	"testing"

	"main/db"
	dbmocks "main/db/mocks"
	apperror "main/error"
	"main/model"
	"main/repository/mocks"
	"main/uof"
	uofimpl "main/uof/impl"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestConfirmEmailChange(t *testing.T) {
	for _, tc := range []struct {
		name               string
		invalid            bool
		foreign            bool
		occupied           bool
		concurrentConflict bool
	}{
		{name: "add email"},
		{name: "invalid code", invalid: true},
		{name: "another user's code", foreign: true},
		{name: "occupied email", occupied: true},
		{name: "email occupied concurrently", concurrentConflict: true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			users := mocks.NewUserRepository(t)
			codes := mocks.NewCodeRepository(t)
			input := &model.Code{UUID: "request-uuid", Code: "123456", SecretKey: "secret", Key: "link-key"}
			stored := &model.Code{UUID: "request-uuid", UserId: 152, Code: "123456", SecretKey: "secret", Key: "link-key", CodeType: model.ChangeEmailCode, AttemptsCount: 3, Email: "new@example.com"}
			codes.On("Get", "request-uuid").Return(stored, nil).Once()
			if tc.foreign {
				stored.UserId = 153
			} else if tc.invalid {
				input.Code = "000000"
				codes.On("Update", mock.MatchedBy(func(code *model.Code) bool { return code.AttemptsCount == 2 })).Return(nil).Once()
			} else {
				codes.On("DeleteByUUID", "request-uuid").Return(nil).Once()
				if tc.occupied {
					users.On("GetByEmail", "new@example.com").Return(&model.User{Id: 153}, nil).Once()
				} else {
					users.On("GetByEmail", "new@example.com").Return(&model.User{}, sql.ErrNoRows).Once()
					if tc.concurrentConflict {
						users.On("UpdateEmail", int64(152), "new@example.com").Return(nil, &pgconn.PgError{Code: "23505"}).Once()
					} else {
						users.On("UpdateEmail", int64(152), "new@example.com").Return(&model.User{Id: 152, Email: "new@example.com"}, nil).Once()
					}
				}
			}
			work := uofimpl.NewUnitOfWorkPostgres(dbmocks.DB{}, func(connection db.Connection) uof.UnitOfWorkStore {
				return uofimpl.NewUofStore(users, nil, nil, nil, nil, nil)
			})
			service := &userServiceImpl{UnitOfWork: work, CodeRepository: codes}
			user, err := service.ConfirmEmailChange(context.Background(), 152, input)
			if tc.invalid || tc.foreign || tc.occupied || tc.concurrentConflict {
				var appErr *apperror.Error
				require.ErrorAs(t, err, &appErr)
				if tc.foreign {
					require.Equal(t, apperror.CodeIsNotFound, appErr.Code)
					codes.AssertNotCalled(t, "Update", mock.Anything)
					codes.AssertNotCalled(t, "DeleteByUUID", mock.Anything)
				} else if tc.invalid {
					require.Equal(t, apperror.WrongCode, appErr.Code)
					require.Equal(t, "2", appErr.Details)
				} else {
					require.Equal(t, apperror.UserAlreadyExists, appErr.Code)
				}
				users.AssertNotCalled(t, "Update", mock.Anything)
			} else {
				require.NoError(t, err)
				require.Equal(t, "new@example.com", user.Email)
			}
		})
	}
}
