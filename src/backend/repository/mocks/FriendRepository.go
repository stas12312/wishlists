// Code generated by mockery v2.20.0. DO NOT EDIT.

package mocks

import (
	model "main/model"

	mock "github.com/stretchr/testify/mock"
)

// FriendRepository is an autogenerated mock type for the FriendRepository type
type FriendRepository struct {
	mock.Mock
}

// CreateFriend provides a mock function with given fields: fUserId, sUserId
func (_m *FriendRepository) CreateFriend(fUserId int64, sUserId int64) error {
	ret := _m.Called(fUserId, sUserId)

	var r0 error
	if rf, ok := ret.Get(0).(func(int64, int64) error); ok {
		r0 = rf(fUserId, sUserId)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// CreateFriendRequest provides a mock function with given fields: fromUserId, toUserId
func (_m *FriendRepository) CreateFriendRequest(fromUserId int64, toUserId int64) error {
	ret := _m.Called(fromUserId, toUserId)

	var r0 error
	if rf, ok := ret.Get(0).(func(int64, int64) error); ok {
		r0 = rf(fromUserId, toUserId)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// DeleteFriend provides a mock function with given fields: fUserId, sUserId
func (_m *FriendRepository) DeleteFriend(fUserId int64, sUserId int64) error {
	ret := _m.Called(fUserId, sUserId)

	var r0 error
	if rf, ok := ret.Get(0).(func(int64, int64) error); ok {
		r0 = rf(fUserId, sUserId)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// DeleteFriendRequest provides a mock function with given fields: fromUserId, toUserId
func (_m *FriendRepository) DeleteFriendRequest(fromUserId int64, toUserId int64) error {
	ret := _m.Called(fromUserId, toUserId)

	var r0 error
	if rf, ok := ret.Get(0).(func(int64, int64) error); ok {
		r0 = rf(fromUserId, toUserId)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// FriendRequestList provides a mock function with given fields: userId
func (_m *FriendRepository) FriendRequestList(userId int64) (*[]model.FriendRequest, error) {
	ret := _m.Called(userId)

	var r0 *[]model.FriendRequest
	var r1 error
	if rf, ok := ret.Get(0).(func(int64) (*[]model.FriendRequest, error)); ok {
		return rf(userId)
	}
	if rf, ok := ret.Get(0).(func(int64) *[]model.FriendRequest); ok {
		r0 = rf(userId)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*[]model.FriendRequest)
		}
	}

	if rf, ok := ret.Get(1).(func(int64) error); ok {
		r1 = rf(userId)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetCounters provides a mock function with given fields: userId
func (_m *FriendRepository) GetCounters(userId int64) (model.Counters, error) {
	ret := _m.Called(userId)

	var r0 model.Counters
	var r1 error
	if rf, ok := ret.Get(0).(func(int64) (model.Counters, error)); ok {
		return rf(userId)
	}
	if rf, ok := ret.Get(0).(func(int64) model.Counters); ok {
		r0 = rf(userId)
	} else {
		r0 = ret.Get(0).(model.Counters)
	}

	if rf, ok := ret.Get(1).(func(int64) error); ok {
		r1 = rf(userId)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetFriendRequest provides a mock function with given fields: fUserId, sUserId
func (_m *FriendRepository) GetFriendRequest(fUserId int64, sUserId int64) (*model.RawFriendRequest, error) {
	ret := _m.Called(fUserId, sUserId)

	var r0 *model.RawFriendRequest
	var r1 error
	if rf, ok := ret.Get(0).(func(int64, int64) (*model.RawFriendRequest, error)); ok {
		return rf(fUserId, sUserId)
	}
	if rf, ok := ret.Get(0).(func(int64, int64) *model.RawFriendRequest); ok {
		r0 = rf(fUserId, sUserId)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.RawFriendRequest)
		}
	}

	if rf, ok := ret.Get(1).(func(int64, int64) error); ok {
		r1 = rf(fUserId, sUserId)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// HasLink provides a mock function with given fields: fUserId, sUserId
func (_m *FriendRepository) HasLink(fUserId int64, sUserId int64) bool {
	ret := _m.Called(fUserId, sUserId)

	var r0 bool
	if rf, ok := ret.Get(0).(func(int64, int64) bool); ok {
		r0 = rf(fUserId, sUserId)
	} else {
		r0 = ret.Get(0).(bool)
	}

	return r0
}

// ListFriends provides a mock function with given fields: userId
func (_m *FriendRepository) ListFriends(userId int64) (*[]model.User, error) {
	ret := _m.Called(userId)

	var r0 *[]model.User
	var r1 error
	if rf, ok := ret.Get(0).(func(int64) (*[]model.User, error)); ok {
		return rf(userId)
	}
	if rf, ok := ret.Get(0).(func(int64) *[]model.User); ok {
		r0 = rf(userId)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*[]model.User)
		}
	}

	if rf, ok := ret.Get(1).(func(int64) error); ok {
		r1 = rf(userId)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// UpdateFriendRequest provides a mock function with given fields: fromUserId, toUserId, status
func (_m *FriendRepository) UpdateFriendRequest(fromUserId int64, toUserId int64, status int) error {
	ret := _m.Called(fromUserId, toUserId, status)

	var r0 error
	if rf, ok := ret.Get(0).(func(int64, int64, int) error); ok {
		r0 = rf(fromUserId, toUserId, status)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

type mockConstructorTestingTNewFriendRepository interface {
	mock.TestingT
	Cleanup(func())
}

// NewFriendRepository creates a new instance of FriendRepository. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
func NewFriendRepository(t mockConstructorTestingTNewFriendRepository) *FriendRepository {
	mock := &FriendRepository{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
