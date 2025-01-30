package impl

import "main/db"

func NewAccountPostgres(conn db.Connection) *AccountPostgres {
	return &AccountPostgres{conn}
}

type AccountPostgres struct {
	db.Connection
}

func (a *AccountPostgres) Delete(userId int64) error {
	q := `
WITH
    delete_friends AS (
        DELETE FROM	friends
        WHERE
            f_user_id = $1
            OR s_user_id = $1
    ),
    delete_friend_request AS (
        DELETE FROM friend_requests
        WHERE
            from_user_id = $1
            OR to_user_id = $1
    ),
    reset_reserved_wishlists AS (
        UPDATE wishes
        SET presenter_id = NULL
        WHERE presenter_id = $1
    ),
    delete_wishes AS (
        DELETE FROM wishes
        WHERE wishlist_uuid IN (
            SELECT wishlist_uuid
            FROM wishlists
            WHERE
                wishlists.wishlist_uuid = wishes.wishlist_uuid
                AND wishlists.user_id = $1
        )
    ),
    delete_wishlists AS (
        DELETE FROM wishlists
        WHERE user_id = $1
    ),
    delete_oauth AS (
        DELETE FROM oauth_user
        WHERE user_id = $1
    ),
    delete_user AS (
        DELETE FROM users
        WHERE user_id = $1
    )
    SELECT TRUE AS result
`
	_, err := a.Exec(q, userId)
	return err
}
