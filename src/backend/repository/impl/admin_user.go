package impl

import (
	"main/db"
	"main/model"
)

type AdminUserPostgres struct{ db.Connection }

func NewAdminUserRepository(connection db.Connection) *AdminUserPostgres {
	return &AdminUserPostgres{connection}
}

const adminUserColumns = `user_id, name, username, COALESCE(email, '') AS email,
is_active, is_admin, created_at, (password <> '') AS has_password`

func (r *AdminUserPostgres) List(search string, before int64, count int) ([]model.AdminUser, error) {
	users := make([]model.AdminUser, 0)
	err := r.Select(&users, `SELECT `+adminUserColumns+` FROM users
WHERE ($2 = 0 OR user_id < $2) AND ($1 = '' OR
strpos(lower(name), lower($1)) > 0 OR strpos(lower(username), lower($1)) > 0 OR
strpos(lower(COALESCE(email, '')), lower($1)) > 0 OR user_id::text = $1)
ORDER BY user_id DESC LIMIT $3`, search, before, count)
	return users, err
}

func (r *AdminUserPostgres) Get(id int64) (*model.AdminUser, error) {
	user := &model.AdminUser{}
	err := r.Connection.Get(user, `SELECT `+adminUserColumns+` FROM users WHERE user_id = $1`, id)
	return user, err
}

func (r *AdminUserPostgres) ListLinks(id int64) ([]model.OAuthUser, error) {
	links := make([]model.OAuthUser, 0)
	err := r.Select(&links, `SELECT provider, oauth_user_id, user_id FROM oauth_user WHERE user_id = $1 ORDER BY provider, oauth_user_id`, id)
	return links, err
}

func (r *AdminUserPostgres) DeleteLink(id int64, provider, externalID string) (bool, error) {
	result, err := r.Exec(`DELETE FROM oauth_user WHERE user_id = $1 AND provider = $2 AND oauth_user_id = $3`, id, provider, externalID)
	if err != nil {
		return false, err
	}
	count, err := result.RowsAffected()
	return count > 0, err
}
