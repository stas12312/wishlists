// Code generated by mockery v2.20.0. DO NOT EDIT.

package mocks

import (
	model "main/model"

	mock "github.com/stretchr/testify/mock"
)

// WishlistRepository is an autogenerated mock type for the WishlistRepository type
type WishlistRepository struct {
	mock.Mock
}

// Create provides a mock function with given fields: wishlist
func (_m *WishlistRepository) Create(wishlist *model.Wishlist) (*model.Wishlist, error) {
	ret := _m.Called(wishlist)

	var r0 *model.Wishlist
	var r1 error
	if rf, ok := ret.Get(0).(func(*model.Wishlist) (*model.Wishlist, error)); ok {
		return rf(wishlist)
	}
	if rf, ok := ret.Get(0).(func(*model.Wishlist) *model.Wishlist); ok {
		r0 = rf(wishlist)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.Wishlist)
		}
	}

	if rf, ok := ret.Get(1).(func(*model.Wishlist) error); ok {
		r1 = rf(wishlist)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Delete provides a mock function with given fields: uuid
func (_m *WishlistRepository) Delete(uuid string) error {
	ret := _m.Called(uuid)

	var r0 error
	if rf, ok := ret.Get(0).(func(string) error); ok {
		r0 = rf(uuid)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// GetByUUID provides a mock function with given fields: uuid
func (_m *WishlistRepository) GetByUUID(uuid string) (*model.Wishlist, error) {
	ret := _m.Called(uuid)

	var r0 *model.Wishlist
	var r1 error
	if rf, ok := ret.Get(0).(func(string) (*model.Wishlist, error)); ok {
		return rf(uuid)
	}
	if rf, ok := ret.Get(0).(func(string) *model.Wishlist); ok {
		r0 = rf(uuid)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.Wishlist)
		}
	}

	if rf, ok := ret.Get(1).(func(string) error); ok {
		r1 = rf(uuid)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// List provides a mock function with given fields: userId, filter, navigation
func (_m *WishlistRepository) List(userId int64, filter model.WishlistFilter, navigation model.Navigation) ([]model.Wishlist, error) {
	ret := _m.Called(userId, filter, navigation)

	var r0 []model.Wishlist
	var r1 error
	if rf, ok := ret.Get(0).(func(int64, model.WishlistFilter, model.Navigation) ([]model.Wishlist, error)); ok {
		return rf(userId, filter, navigation)
	}
	if rf, ok := ret.Get(0).(func(int64, model.WishlistFilter, model.Navigation) []model.Wishlist); ok {
		r0 = rf(userId, filter, navigation)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]model.Wishlist)
		}
	}

	if rf, ok := ret.Get(1).(func(int64, model.WishlistFilter, model.Navigation) error); ok {
		r1 = rf(userId, filter, navigation)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Restore provides a mock function with given fields: uuid
func (_m *WishlistRepository) Restore(uuid string) error {
	ret := _m.Called(uuid)

	var r0 error
	if rf, ok := ret.Get(0).(func(string) error); ok {
		r0 = rf(uuid)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// Update provides a mock function with given fields: wishlist
func (_m *WishlistRepository) Update(wishlist *model.Wishlist) (*model.Wishlist, error) {
	ret := _m.Called(wishlist)

	var r0 *model.Wishlist
	var r1 error
	if rf, ok := ret.Get(0).(func(*model.Wishlist) (*model.Wishlist, error)); ok {
		return rf(wishlist)
	}
	if rf, ok := ret.Get(0).(func(*model.Wishlist) *model.Wishlist); ok {
		r0 = rf(wishlist)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.Wishlist)
		}
	}

	if rf, ok := ret.Get(1).(func(*model.Wishlist) error); ok {
		r1 = rf(wishlist)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

type mockConstructorTestingTNewWishlistRepository interface {
	mock.TestingT
	Cleanup(func())
}

// NewWishlistRepository creates a new instance of WishlistRepository. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
func NewWishlistRepository(t mockConstructorTestingTNewWishlistRepository) *WishlistRepository {
	mock := &WishlistRepository{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
