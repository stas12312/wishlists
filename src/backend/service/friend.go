package service

import "main/model"

//go:generate mockery --name FriendService

type FriendService interface {
	AddFriend(userId int64, friendId int64) error
	ListOfFriends(userId int64) (*[]model.User, error)
	RemoveFriend(userId int64, friendId int64) error
	ApplyRequest(userId int64, fromUserId int64) error
	DeclineRequest(userId int64, fromUserId int64) error
	FriendRequestList(userId int64) (*[]model.FriendRequest, error)
	IsFriends(userId int64, friendId int64) bool
	GetFriendStatus(userId int64, friendId int64) model.FriendStatus
	GetCounters(userId int64) (model.Counters, error)
	DeleteRequest(fromUserId int64, toUserId int64) error
}
