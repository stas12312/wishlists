package impl

import (
	"database/sql"
	"errors"
	"main/db"
	"main/model"
)

func NewFriendRepositoryPostgres(connection db.Connection) *FriendRepositoryPostgres {
	return &FriendRepositoryPostgres{connection}
}

type FriendRepositoryPostgres struct {
	db.Connection
}

func (r *FriendRepositoryPostgres) ListFriends(userId int64) (*[]model.User, error) {
	q := `
	WITH friend_ids AS (
		SELECT f_user_id
		FROM friends
		WHERE s_user_id = $1
		UNION ALL
		SELECT s_user_id
		FROM friends
		WHERE f_user_id = $1
	)
	SELECT * from users
	WHERE user_id = ANY(TABLE friend_ids)
`
	result := &[]model.User{}
	err := r.Select(result, q, userId)
	return result, err
}

func (r *FriendRepositoryPostgres) CreateFriend(fUserId int64, sUserId int64) error {
	q := `
	INSERT INTO friends (f_user_id, s_user_id)
	VALUES ($1, $2)
`
	_, err := r.Exec(q, fUserId, sUserId)
	return err
}

func (r *FriendRepositoryPostgres) DeleteFriend(fUserId int64, sUserId int64) error {
	q := `
	DELETE FROM friends
	WHERE 
	    (f_user_id = $1 AND s_user_id = $2)
		OR (f_user_id = $2 AND s_user_id = $1) 
`
	_, err := r.Exec(q, fUserId, sUserId)
	return err
}

func (r *FriendRepositoryPostgres) HasLink(fUserId int64, sUserId int64) bool {
	q := `
	SELECT EXISTS(
		SELECT TRUE
		FROM friends
		WHERE
		    (f_user_id = $1 AND s_user_id = $2)
			OR (f_user_id = $2 AND s_user_id = $1)
	)
`
	var result bool
	err := r.Get(&result, q, fUserId, sUserId)
	if err != nil {
		return false
	}
	return result
}

func (r *FriendRepositoryPostgres) CreateFriendRequest(fromUserId int64, toUserId int64) error {
	q := `
	INSERT INTO friend_requests (from_user_id, to_user_id)
	VALUES ($1, $2)
`

	_, err := r.Exec(q, fromUserId, toUserId)
	return err
}

func (r *FriendRepositoryPostgres) UpdateFriendRequest(fromUserId int64, toUserId int64, status int) error {
	q := `
	UPDATE friend_requests
	SET status = $3
	WHERE from_user_id = $1 AND to_user_id = $2
`
	_, err := r.Exec(q, fromUserId, toUserId, status)
	return err
}

func (r *FriendRepositoryPostgres) DeleteFriendRequest(fromUserId int64, toUserId int64) error {
	q := `
		DELETE FROM friend_requests
		WHERE from_user_id = $1 AND to_user_id = $2
		AND status = 0
	`

	_, err := r.Exec(q, fromUserId, toUserId)
	return err
}

func (r *FriendRepositoryPostgres) GetFriendRequest(fUserId int64, sUserId int64) (*model.RawFriendRequest, error) {
	q := `
	SELECT
	    from_user_id,
	    to_user_id,
	    status
	FROM friend_requests
	WHERE
		(
		    (from_user_id = $1 AND to_user_id = $2)
			OR (from_user_id = $2 AND to_user_id = $1)
	   	)
		AND status = 0
	
`
	result := &model.RawFriendRequest{}
	err := r.Get(result, q, fUserId, sUserId)
	switch {
	case errors.Is(err, sql.ErrNoRows):
		return result, nil
	default:
		return result, err
	}

}

func (r *FriendRepositoryPostgres) FriendRequestList(userId int64) (*[]model.FriendRequest, error) {

	type RawFriendRequest struct {
		FromUserId       int64  `db:"from_user_id"`
		FromUserName     string `db:"from_user_name"`
		FromUserImage    string `db:"from_user_image"`
		FromUserUsername string `db:"from_user_username"`

		ToUserId       int64  `db:"to_user_id"`
		ToUserName     string `db:"to_user_name"`
		ToUserImage    string `db:"to_user_image"`
		ToUserUsername string `db:"to_user_username"`
	}

	q := `
	SELECT 
		from_user.user_id AS from_user_id,
		from_user.image AS from_user_image,
		from_user.username AS from_user_username,
		from_user.name AS from_user_name,
		
		to_user.user_id AS to_user_id,
		to_user.image AS to_user_image,
		to_user.username AS to_user_username,
		to_user.name AS to_user_name
	FROM friend_requests
	JOIN users AS from_user ON from_user.user_id = friend_requests.from_user_id
	JOIN users AS to_user ON to_user.user_id = friend_requests.to_user_id
	WHERE
	    (from_user_id = $1 OR to_user_id = $1)
	    AND status = 0
		ORDER BY created_at DESC 
	
`
	rawData := &[]RawFriendRequest{}
	err := r.Select(rawData, q, userId)

	result := make([]model.FriendRequest, 0)

	for _, rawRequest := range *rawData {
		result = append(result, model.FriendRequest{
			FromUser: model.User{
				Id:       rawRequest.FromUserId,
				Name:     rawRequest.FromUserName,
				Username: rawRequest.FromUserUsername,
				Image:    rawRequest.FromUserImage,
			},
			ToUser: model.User{
				Id:       rawRequest.ToUserId,
				Name:     rawRequest.ToUserName,
				Username: rawRequest.ToUserUsername,
				Image:    rawRequest.ToUserImage,
			}})
	}

	return &result, err
}

func (r *FriendRepositoryPostgres) GetCounters(userId int64) (model.Counters, error) {
	q := `
		SELECT 
		    (	
		    	SELECT COUNT(*) 
		    	FROM friends 
		    	WHERE 
		    	    f_user_id = $1 
		    	   OR s_user_id = $1
		    ) AS friends_count,
		    (
		    	SELECT COUNT(*)
		    	FROM friend_requests
		    	WHERE 
		    	    to_user_id = $1
		    		AND status = 0
		    ) AS incoming_requests_count
			
`
	result := &model.Counters{}
	err := r.Get(result, q, userId)
	return *result, err
}
