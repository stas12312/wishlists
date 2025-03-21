// Code generated by mockery v2.20.0. DO NOT EDIT.

package mocks

import (
	model "main/model"

	mock "github.com/stretchr/testify/mock"

	time "time"
)

// CodeRepository is an autogenerated mock type for the CodeRepository type
type CodeRepository struct {
	mock.Mock
}

// Create provides a mock function with given fields: code
func (_m *CodeRepository) Create(code *model.Code) (*model.Code, error) {
	ret := _m.Called(code)

	var r0 *model.Code
	var r1 error
	if rf, ok := ret.Get(0).(func(*model.Code) (*model.Code, error)); ok {
		return rf(code)
	}
	if rf, ok := ret.Get(0).(func(*model.Code) *model.Code); ok {
		r0 = rf(code)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.Code)
		}
	}

	if rf, ok := ret.Get(1).(func(*model.Code) error); ok {
		r1 = rf(code)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// DeleteByUUID provides a mock function with given fields: uuid
func (_m *CodeRepository) DeleteByUUID(uuid string) error {
	ret := _m.Called(uuid)

	var r0 error
	if rf, ok := ret.Get(0).(func(string) error); ok {
		r0 = rf(uuid)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// Get provides a mock function with given fields: uuid
func (_m *CodeRepository) Get(uuid string) (*model.Code, error) {
	ret := _m.Called(uuid)

	var r0 *model.Code
	var r1 error
	if rf, ok := ret.Get(0).(func(string) (*model.Code, error)); ok {
		return rf(uuid)
	}
	if rf, ok := ret.Get(0).(func(string) *model.Code); ok {
		r0 = rf(uuid)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.Code)
		}
	}

	if rf, ok := ret.Get(1).(func(string) error); ok {
		r1 = rf(uuid)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetEmailCountDown provides a mock function with given fields: email
func (_m *CodeRepository) GetEmailCountDown(email string) (time.Duration, error) {
	ret := _m.Called(email)

	var r0 time.Duration
	var r1 error
	if rf, ok := ret.Get(0).(func(string) (time.Duration, error)); ok {
		return rf(email)
	}
	if rf, ok := ret.Get(0).(func(string) time.Duration); ok {
		r0 = rf(email)
	} else {
		r0 = ret.Get(0).(time.Duration)
	}

	if rf, ok := ret.Get(1).(func(string) error); ok {
		r1 = rf(email)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SaveEmailCountDown provides a mock function with given fields: email, duration
func (_m *CodeRepository) SaveEmailCountDown(email string, duration time.Duration) error {
	ret := _m.Called(email, duration)

	var r0 error
	if rf, ok := ret.Get(0).(func(string, time.Duration) error); ok {
		r0 = rf(email, duration)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// Update provides a mock function with given fields: code
func (_m *CodeRepository) Update(code *model.Code) error {
	ret := _m.Called(code)

	var r0 error
	if rf, ok := ret.Get(0).(func(*model.Code) error); ok {
		r0 = rf(code)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

type mockConstructorTestingTNewCodeRepository interface {
	mock.TestingT
	Cleanup(func())
}

// NewCodeRepository creates a new instance of CodeRepository. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
func NewCodeRepository(t mockConstructorTestingTNewCodeRepository) *CodeRepository {
	mock := &CodeRepository{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
