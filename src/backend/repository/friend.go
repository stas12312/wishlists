package repository

import "main/model"

//go:generate mockery --name FriendRepository

type FriendRepository interface {
	CreateFriend(fUserId int64, sUserId int64) error
	DeleteFriend(fUserId int64, sUserId int64) error
	ListFriends(userId int64) (*[]model.User, error)
	HasLink(fUserId int64, sUserId int64) bool
	CreateFriendRequest(fromUserId int64, toUserId int64) error
	UpdateFriendRequest(fromUserId int64, toUserId int64, status int) error
	DeleteFriendRequest(fromUserId int64, toUserId int64) error
	GetFriendRequest(fUserId int64, sUserId int64) (*model.RawFriendRequest, error)
	FriendRequestList(userId int64) (*[]model.FriendRequest, error)
	GetCounters(userId int64) (model.Counters, error)
}
