package db

import "database/sql"

type Connection interface {
	Get(dest interface{}, query string, args ...interface{}) error
	Exec(query string, args ...any) (sql.Result, error)
	Select(dest interface{}, query string, args ...interface{}) error
}

//go:generate mockery --name Transaction
type Transaction interface {
	Connection
	Commit() error
	Rollback() error
}
