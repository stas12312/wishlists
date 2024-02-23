package mocks

import "database/sql"

type Connection struct{}

func (c *Connection) Get(dest interface{}, query string, args ...interface{}) error {
	return nil
}

func (c *Connection) Exec(query string, args ...any) (sql.Result, error) {
	return Result{}, nil
}

func (c *Connection) Select(dest interface{}, query string, args ...interface{}) error {
	return nil
}
