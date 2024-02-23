package db

import (
	"context"
	"database/sql"
)

//go:generate mockery --name DB
type DB interface {
	BeginTx(ctx context.Context, opts *sql.TxOptions) (Transaction, error)
}
