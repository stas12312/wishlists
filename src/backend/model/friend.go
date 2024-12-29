package model

type FriendRequest struct {
	FromUser User `json:"from_user"`
	ToUser   User `json:"to_user"`
	Status   int  `db:"status" json:"status"` // 0 - Отправлена, 1 - Принята, 2 - Отклонена
}
type RawFriendRequest struct {
	FromUserId int64 `db:"from_user_id"`
	ToUserId   int64 `db:"to_user_id"`
	Status     int   `db:"status"`
}

type FriendStatus int

const (
	NoFriend FriendStatus = iota
	HasOutcomingRequest
	HasIncomingRequest
	IsFriend
	IsYourSelf
)

type Counters struct {
	Friends          int `db:"friends_count" json:"friends"`
	IncomingRequests int `db:"incoming_requests_count" json:"incoming_requests"`
}
