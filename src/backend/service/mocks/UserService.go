// Code generated by mockery v2.40.1. DO NOT EDIT.

package mocks

import (
	context "context"
	model "main/model"

	mock "github.com/stretchr/testify/mock"
)

// UserService is an autogenerated mock type for the UserService type
type UserService struct {
	mock.Mock
}

// CheckCode provides a mock function with given fields: ctx, code
func (_m *UserService) CheckCode(ctx context.Context, code *model.Code) (*model.Code, bool) {
	ret := _m.Called(ctx, code)

	if len(ret) == 0 {
		panic("no return value specified for CheckCode")
	}

	var r0 *model.Code
	var r1 bool
	if rf, ok := ret.Get(0).(func(context.Context, *model.Code) (*model.Code, bool)); ok {
		return rf(ctx, code)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *model.Code) *model.Code); ok {
		r0 = rf(ctx, code)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.Code)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *model.Code) bool); ok {
		r1 = rf(ctx, code)
	} else {
		r1 = ret.Get(1).(bool)
	}

	return r0, r1
}

// Confirm provides a mock function with given fields: ctx, code
func (_m *UserService) Confirm(ctx context.Context, code *model.Code) (*model.User, bool, error) {
	ret := _m.Called(ctx, code)

	if len(ret) == 0 {
		panic("no return value specified for Confirm")
	}

	var r0 *model.User
	var r1 bool
	var r2 error
	if rf, ok := ret.Get(0).(func(context.Context, *model.Code) (*model.User, bool, error)); ok {
		return rf(ctx, code)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *model.Code) *model.User); ok {
		r0 = rf(ctx, code)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.User)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *model.Code) bool); ok {
		r1 = rf(ctx, code)
	} else {
		r1 = ret.Get(1).(bool)
	}

	if rf, ok := ret.Get(2).(func(context.Context, *model.Code) error); ok {
		r2 = rf(ctx, code)
	} else {
		r2 = ret.Error(2)
	}

	return r0, r1, r2
}

// GetByEmail provides a mock function with given fields: ctx, email
func (_m *UserService) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	ret := _m.Called(ctx, email)

	if len(ret) == 0 {
		panic("no return value specified for GetByEmail")
	}

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

	if len(ret) == 0 {
		panic("no return value specified for GetById")
	}

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

// Login provides a mock function with given fields: ctx, email, password
func (_m *UserService) Login(ctx context.Context, email string, password string) (*model.User, error) {
	ret := _m.Called(ctx, email, password)

	if len(ret) == 0 {
		panic("no return value specified for Login")
	}

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

// Register provides a mock function with given fields: ctx, email, password, name
func (_m *UserService) Register(ctx context.Context, email string, password string, name string) (*model.User, *model.Code, error) {
	ret := _m.Called(ctx, email, password, name)

	if len(ret) == 0 {
		panic("no return value specified for Register")
	}

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
func (_m *UserService) Reset(ctx context.Context, code *model.Code, password *model.ResetPassword) (*model.User, error) {
	ret := _m.Called(ctx, code, password)

	if len(ret) == 0 {
		panic("no return value specified for Reset")
	}

	var r0 *model.User
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *model.Code, *model.ResetPassword) (*model.User, error)); ok {
		return rf(ctx, code, password)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *model.Code, *model.ResetPassword) *model.User); ok {
		r0 = rf(ctx, code, password)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.User)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *model.Code, *model.ResetPassword) error); ok {
		r1 = rf(ctx, code, password)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Restore provides a mock function with given fields: ctx, email
func (_m *UserService) Restore(ctx context.Context, email string) (*model.Code, error) {
	ret := _m.Called(ctx, email)

	if len(ret) == 0 {
		panic("no return value specified for Restore")
	}

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

// NewUserService creates a new instance of UserService. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewUserService(t interface {
	mock.TestingT
	Cleanup(func())
}) *UserService {
	mock := &UserService{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
