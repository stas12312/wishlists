package mocks

import (
	"database/sql"
)

type Result struct {
}

func (r Result) LastInsertId() (int64, error) {
	return 0, nil
}

func (r Result) RowsAffected() (int64, error) {
	return 0, nil
}

type Transaction struct{}

func (Transaction) Get(dest interface{}, query string, args ...interface{}) error {
	return nil
}

func (Transaction) Exec(query string, args ...any) (sql.Result, error) {
	return Result{}, nil
}

func (Transaction) Select(dest interface{}, query string, args ...interface{}) error {
	return nil
}

func (Transaction) Commit() error {
	return nil
}

func (Transaction) Rollback() error {
	return nil
}
