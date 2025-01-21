package impl

import (
	"main/db"
	"main/model"
)

func NewUserRepositoryImpl(connection db.Connection) *UserRepositoryPostgres {
	return &UserRepositoryPostgres{connection}
}

type UserRepositoryPostgres struct {
	db.Connection
}

func (r *UserRepositoryPostgres) GetByEmail(email string) (*model.User, error) {
	query := `
SELECT *
FROM users
WHERE 
    lower(email) = lower($1)
`
	user := &model.User{}

	err := r.Get(user, query, email)

	return user, err
}

func (r *UserRepositoryPostgres) GetByUsername(username string) (*model.User, error) {
	query := `
		SELECT *
		FROM users
		WHERE 
			lower(username) = lower($1)
`
	user := &model.User{}

	err := r.Get(user, query, username)

	return user, err
}

func (r *UserRepositoryPostgres) GetById(id int64) (*model.User, error) {
	query := `
SELECT *
FROM users
WHERE
	user_id = $1
`
	user := &model.User{}

	err := r.Get(user, query, id)
	return user, err
}

func (r *UserRepositoryPostgres) Create(
	email string, hash string, name string, isActive bool, image string,
) (*model.User, error) {

	query := `
INSERT INTO users (email, password, name, is_active, image) 
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (email)
    DO UPDATE 
	SET 
	    email = $1,
		password = $2,
		name = $3,
		is_active = $4,
		image = $5
RETURNING *
`
	user := &model.User{}

	err := r.Get(user, query, email, hash, name, isActive, image)
	return user, err
}

func (r *UserRepositoryPostgres) Update(user *model.User) (*model.User, error) {

	query := `
	UPDATE users
	SET 
	    password = $2,
		name = $3,
		is_active = $4,
		username = $5,
		image = $6
	WHERE user_id = $1
	RETURNING *
`

	updatedUser := &model.User{}

	err := r.Get(updatedUser, query, user.Id, user.Password, user.Name, user.IsActive, user.Username, user.Image)

	return updatedUser, err

}

func (r *UserRepositoryPostgres) UpdatePassword(userId int64, hashPassword string) error {
	query := `
	UPDATE users
	SET
	    password = $2
	WHERE user_id = $1
`

	_, err := r.Exec(query, userId, hashPassword)
	return err
}
