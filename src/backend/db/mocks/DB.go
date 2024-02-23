package mocks

import (
	"context"
	"database/sql"
	"main/db"
)

type DB struct {
}

func (DB) BeginTx(ctx context.Context, opts *sql.TxOptions) (db.Transaction, error) {
	return Transaction{}, nil
}
