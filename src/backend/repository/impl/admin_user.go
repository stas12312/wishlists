package impl

import (
	"database/sql"
	"main/db"
	"main/model"
)

type AdminUserPostgres struct{ db.Connection }

func NewAdminUserRepository(connection db.Connection) *AdminUserPostgres {
	return &AdminUserPostgres{connection}
}

func (r *AdminUserPostgres) List(search string, before int64, count int) ([]model.AdminUser, error) {
	query := `
		SELECT
			user_id,
			name,
			username,
			COALESCE(email, '') AS email,
			is_active,
			is_admin,
			created_at,
			password <> '' AS has_password
		FROM users
		WHERE
			($2 = 0 OR user_id < $2)
			AND (
				$1 = ''
				OR strpos(lower(name), lower($1)) > 0
				OR strpos(lower(username), lower($1)) > 0
				OR strpos(lower(COALESCE(email, '')), lower($1)) > 0
				OR user_id::text = $1
			)
		ORDER BY user_id DESC
		LIMIT $3
`
	users := make([]model.AdminUser, 0)
	err := r.Select(&users, query, search, before, count)
	return users, err
}

func (r *AdminUserPostgres) Get(id int64) (*model.AdminUser, error) {
	query := `
		SELECT
			user_id,
			name,
			username,
			COALESCE(email, '') AS email,
			is_active,
			is_admin,
			created_at,
			password <> '' AS has_password
		FROM users
		WHERE user_id = $1
`
	user := &model.AdminUser{}
	err := r.Connection.Get(user, query, id)
	return user, err
}

func (r *AdminUserPostgres) ListLinks(id int64) ([]model.OAuthUser, error) {
	query := `
		SELECT
			provider,
			oauth_user_id,
			user_id
		FROM oauth_user
		WHERE user_id = $1
		ORDER BY provider, oauth_user_id
`
	links := make([]model.OAuthUser, 0)
	err := r.Select(&links, query, id)
	return links, err
}

func (r *AdminUserPostgres) DeleteLink(id int64, provider, externalID string) (bool, error) {
	return NewOAuthPostgresRepository(r.Connection).DeleteLink(id, provider, externalID)
}

func (r *AdminUserPostgres) ListWishlists(id int64, offset int) ([]model.AdminUserWishlist, error) {
	query := `
 SELECT wishlist_uuid, name, is_active, settings @> '{"for_other":true}'::jsonb AS for_other
 FROM wishlists
 WHERE user_id = $1
 ORDER BY created_at DESC, wishlist_uuid DESC
 LIMIT 30 OFFSET $2
 `
	wishlists := make([]model.AdminUserWishlist, 0)
	err := r.Select(&wishlists, query, id, offset)
	return wishlists, err
}

func (r *AdminUserPostgres) SetWishlistType(id int64, uuid string, forOther bool) error {
	query := `
 UPDATE wishlists
 SET settings = jsonb_set(settings, '{for_other}', to_jsonb($3::boolean))
 WHERE user_id = $1 AND wishlist_uuid = $2
 `
	result, err := r.Exec(query, id, uuid, forOther)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err == nil && rows == 0 {
		return sql.ErrNoRows
	}
	return err
}
