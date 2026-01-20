package impl

import (
	"log"
	"main/db"
	"main/model"
)

func NewFeedRepositoryPostgres(connection db.Connection) *FeedRepositoryPostgres {
	return &FeedRepositoryPostgres{connection}
}

type FeedRepositoryPostgres struct {
	db.Connection
}

func (r *FeedRepositoryPostgres) Get(userId int64, navigation *model.Navigation) ([]model.Wish, error) {

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
	SELECT
	    wishes.*, 
		wishlists.user_id,
		wishes.presenter_id IS NOT NULL AS is_reserved,

		users.name AS "user.name",
		users.image AS "user.image",
		users.username AS "user.username",
		users.user_id AS "user.user_id",
		
		wishlists.name AS "wishlist.name",
		wishlists.date AS "wishlist.date"
	FROM wishlists
	JOIN users USING (user_id)
	JOIN wishes ON wishlists.wishlist_uuid = wishes.wishlist_uuid
	WHERE 
		(
			 wishes.created_at < COALESCE(NULLIF($2, '')::timestamptz, NOW())
			 OR (
				 wishes.created_at = COALESCE(NULLIF($2, '')::timestamptz, NOW())
				 AND wishes.wish_uuid < COALESCE(NULLIF($3, '')::uuid, 'ffffffff-ffff-ffff-ffff-ffffffffffff')
			)
		)
		AND wishlists.user_id = ANY(TABLE friend_ids)
		AND wishlists.visible IN (1, 2)
		OR (
			wishlists.visible = 3
			AND $1 = ANY(wishlists.visible_user_ids)
		)
	ORDER BY wishes.created_at DESC, wishes.wish_uuid DESC
	LIMIT $4
`
	log.Print(navigation.Count)
	result := &[]model.Wish{}
	err := r.Select(result, q, userId, navigation.Cursor[0], navigation.Cursor[1], navigation.Count)
	return *result, err
}
