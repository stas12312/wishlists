package impl

import (
	"github.com/jmoiron/sqlx"
	"main/model"
	"main/repository"
)

func NewUserRepositoryImpl(DB *sqlx.DB) repository.UserRepository {
	return &userRepositoryImpl{DB: DB}
}

type userRepositoryImpl struct {
	*sqlx.DB
}

func (r *userRepositoryImpl) GetByEmail(email string) (*model.User, error) {
	query := `
SELECT *
FROM users
WHERE 
    email = $1
`
	user := &model.User{}

	err := r.Get(user, query, email)

	return user, err
}

func (r *userRepositoryImpl) GetById(id int64) (*model.User, error) {
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

func (r *userRepositoryImpl) Create(email string, hash string, name string) (*model.User, error) {

	query := `
INSERT INTO users (email, password, name, is_active) 
VALUES ($1, $2, $3, FALSE)
ON CONFLICT (email)
    DO UPDATE 
	SET 
	    email = $1,
		password = $2,
		name = $3
RETURNING *
`
	user := &model.User{}

	err := r.Get(user, query, email, hash, name)
	return user, err
}

func (r *userRepositoryImpl) Update(user *model.User) (*model.User, error) {

	query := `
	UPDATE users
	SET 
	    password = $2,
		name = $3,
		is_active = $4
	WHERE user_id = $1
	RETURNING *
`

	updatedUser := &model.User{}

	err := r.Get(updatedUser, query, user.Id, user.Password, user.Name, user.IsActive)

	return updatedUser, err

}
