// Code generated by mockery v2.20.0. DO NOT EDIT.

package mocks

import (
	context "context"
	model "main/model"

	mock "github.com/stretchr/testify/mock"

	oauth "main/oauth"
)

// UserService is an autogenerated mock type for the UserService type
type UserService struct {
	mock.Mock
}

// ChangePassword provides a mock function with given fields: ctx, userId, oldPassword, newPassword
func (_m *UserService) ChangePassword(ctx context.Context, userId int64, oldPassword string, newPassword string) error {
	ret := _m.Called(ctx, userId, oldPassword, newPassword)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, int64, string, string) error); ok {
		r0 = rf(ctx, userId, oldPassword, newPassword)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// CheckCode provides a mock function with given fields: ctx, code, withAttempt
func (_m *UserService) CheckCode(ctx context.Context, code *model.Code, withAttempt bool) (*model.Code, bool) {
	ret := _m.Called(ctx, code, withAttempt)

	var r0 *model.Code
	var r1 bool
	if rf, ok := ret.Get(0).(func(context.Context, *model.Code, bool) (*model.Code, bool)); ok {
		return rf(ctx, code, withAttempt)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *model.Code, bool) *model.Code); ok {
		r0 = rf(ctx, code, withAttempt)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.Code)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *model.Code, bool) bool); ok {
		r1 = rf(ctx, code, withAttempt)
	} else {
		r1 = ret.Get(1).(bool)
	}

	return r0, r1
}

// Confirm provides a mock function with given fields: ctx, code
func (_m *UserService) Confirm(ctx context.Context, code *model.Code) (*model.User, error) {
	ret := _m.Called(ctx, code)

	var r0 *model.User
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *model.Code) (*model.User, error)); ok {
		return rf(ctx, code)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *model.Code) *model.User); ok {
		r0 = rf(ctx, code)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.User)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *model.Code) error); ok {
		r1 = rf(ctx, code)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetByEmail provides a mock function with given fields: ctx, email
func (_m *UserService) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	ret := _m.Called(ctx, email)

	var r0 *model.User
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, string) (*model.User, error)); ok {
		return rf(ctx, email)
	}
	if rf, ok := ret.Get(0).(func(context.Context, string) *model.User); ok {
		r0 = rf(ctx, email)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.User)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, email)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetById provides a mock function with given fields: ctx, id
func (_m *UserService) GetById(ctx context.Context, id int64) (*model.User, error) {
	ret := _m.Called(ctx, id)

	var r0 *model.User
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, int64) (*model.User, error)); ok {
		return rf(ctx, id)
	}
	if rf, ok := ret.Get(0).(func(context.Context, int64) *model.User); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.User)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, int64) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetByUsername provides a mock function with given fields: ctx, username
func (_m *UserService) GetByUsername(ctx context.Context, username string) (*model.User, error) {
	ret := _m.Called(ctx, username)

	var r0 *model.User
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, string) (*model.User, error)); ok {
		return rf(ctx, username)
	}
	if rf, ok := ret.Get(0).(func(context.Context, string) *model.User); ok {
		r0 = rf(ctx, username)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.User)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, username)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// ListOAuthProviders provides a mock function with given fields: ctx
func (_m *UserService) ListOAuthProviders(ctx context.Context) []oauth.Provider {
	ret := _m.Called(ctx)

	var r0 []oauth.Provider
	if rf, ok := ret.Get(0).(func(context.Context) []oauth.Provider); ok {
		r0 = rf(ctx)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]oauth.Provider)
		}
	}

	return r0
}

// Login provides a mock function with given fields: ctx, email, password
func (_m *UserService) Login(ctx context.Context, email string, password string) (*model.User, error) {
	ret := _m.Called(ctx, email, password)

	var r0 *model.User
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, string, string) (*model.User, error)); ok {
		return rf(ctx, email, password)
	}
	if rf, ok := ret.Get(0).(func(context.Context, string, string) *model.User); ok {
		r0 = rf(ctx, email, password)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.User)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, string, string) error); ok {
		r1 = rf(ctx, email, password)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// OAuthAuth provides a mock function with given fields: ctx, userId, oAuthType, code
func (_m *UserService) OAuthAuth(ctx context.Context, userId int64, oAuthType string, code string) (*model.User, error) {
	ret := _m.Called(ctx, userId, oAuthType, code)

	var r0 *model.User
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, int64, string, string) (*model.User, error)); ok {
		return rf(ctx, userId, oAuthType, code)
	}
	if rf, ok := ret.Get(0).(func(context.Context, int64, string, string) *model.User); ok {
		r0 = rf(ctx, userId, oAuthType, code)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.User)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, int64, string, string) error); ok {
		r1 = rf(ctx, userId, oAuthType, code)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Register provides a mock function with given fields: ctx, email, password, name
func (_m *UserService) Register(ctx context.Context, email string, password string, name string) (*model.User, *model.Code, error) {
	ret := _m.Called(ctx, email, password, name)

	var r0 *model.User
	var r1 *model.Code
	var r2 error
	if rf, ok := ret.Get(0).(func(context.Context, string, string, string) (*model.User, *model.Code, error)); ok {
		return rf(ctx, email, password, name)
	}
	if rf, ok := ret.Get(0).(func(context.Context, string, string, string) *model.User); ok {
		r0 = rf(ctx, email, password, name)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.User)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, string, string, string) *model.Code); ok {
		r1 = rf(ctx, email, password, name)
	} else {
		if ret.Get(1) != nil {
			r1 = ret.Get(1).(*model.Code)
		}
	}

	if rf, ok := ret.Get(2).(func(context.Context, string, string, string) error); ok {
		r2 = rf(ctx, email, password, name)
	} else {
		r2 = ret.Error(2)
	}

	return r0, r1, r2
}

// Reset provides a mock function with given fields: ctx, code, password
func (_m *UserService) Reset(ctx context.Context, code *model.Code, password string) (*model.User, error) {
	ret := _m.Called(ctx, code, password)

	var r0 *model.User
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *model.Code, string) (*model.User, error)); ok {
		return rf(ctx, code, password)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *model.Code, string) *model.User); ok {
		r0 = rf(ctx, code, password)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.User)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *model.Code, string) error); ok {
		r1 = rf(ctx, code, password)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Restore provides a mock function with given fields: ctx, email
func (_m *UserService) Restore(ctx context.Context, email string) (*model.Code, error) {
	ret := _m.Called(ctx, email)

	var r0 *model.Code
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, string) (*model.Code, error)); ok {
		return rf(ctx, email)
	}
	if rf, ok := ret.Get(0).(func(context.Context, string) *model.Code); ok {
		r0 = rf(ctx, email)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.Code)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, email)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Update provides a mock function with given fields: ctx, user
func (_m *UserService) Update(ctx context.Context, user *model.UserForUpdate) (*model.User, error) {
	ret := _m.Called(ctx, user)

	var r0 *model.User
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *model.UserForUpdate) (*model.User, error)); ok {
		return rf(ctx, user)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *model.UserForUpdate) *model.User); ok {
		r0 = rf(ctx, user)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.User)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *model.UserForUpdate) error); ok {
		r1 = rf(ctx, user)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

type mockConstructorTestingTNewUserService interface {
	mock.TestingT
	Cleanup(func())
}

// NewUserService creates a new instance of UserService. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
func NewUserService(t mockConstructorTestingTNewUserService) *UserService {
	mock := &UserService{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
