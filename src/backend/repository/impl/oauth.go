package impl

import (
	"main/db"
	"main/model"
)

func NewOAuthPostgresRepository(connection db.Connection) *OAuthUserPostgres {
	return &OAuthUserPostgres{connection}
}

type OAuthUserPostgres struct {
	db.Connection
}

func (o OAuthUserPostgres) Get(provider, oAuthUserId string) (*model.OAuthUser, error) {
	q := `
	SELECT * FROM oauth_user
	WHERE
	    oauth_user_id = $1
		AND provider = $2
`
	oAuthUser := &model.OAuthUser{}

	err := o.Connection.Get(oAuthUser, q, oAuthUserId, provider)
	return oAuthUser, err
}

func (o OAuthUserPostgres) Create(oAuthUser *model.OAuthUser) error {
	q := `
	INSERT INTO oauth_user (provider, user_id, oauth_user_id) 
	VALUES ($1, $2, $3)
`
	_, err := o.Connection.Exec(q, oAuthUser.Provider, oAuthUser.UserId, oAuthUser.OAuthUserId)
	return err
}

func (o OAuthUserPostgres) DeleteByUserId(userId int64, provider string) error {
	q := `
	DELETE FROM oauth_user
	WHERE 
	    user_id = $1
		AND provider = $2
`
	_, err := o.Connection.Exec(q, userId, provider)
	return err
}

func (o OAuthUserPostgres) DeleteByOAuthUserId(oAuthUserId string, provider string) error {
	q := `
	DELETE FROM oauth_user
	WHERE
	    oauth_user_id = $1
		AND provider = $2
`
	_, err := o.Connection.Exec(q, oAuthUserId, provider)
	return err
}

func (o OAuthUserPostgres) ListByUserId(userId int64) ([]model.OAuthUser, error) {
	q := `
	SELECT * FROM oauth_user
	WHERE user_id = $1
`
	var oAuthUsers []model.OAuthUser

	err := o.Connection.Select(oAuthUsers, q, userId)
	return oAuthUsers, err

}

func (o OAuthUserPostgres) Update(user *model.OAuthUser) error {
	q := `
	UPDATE oauth_user
		SET user_id = $3	
	WHERE 
		oauth_user_id = $1
		AND provider = $2
`
	_, err := o.Connection.Exec(q, user.OAuthUserId, user.Provider, user.UserId)
	return err
}
