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
INSERT INTO users (email, password, name) 
VALUES ($1, $2, $3)
RETURNING *
`
	user := &model.User{}

	err := r.Get(user, query, email, hash, name)
	return user, err
}
