package sqlx_db

import (
	"context"
	"database/sql"
	"github.com/jmoiron/sqlx"
	"main/db"
)

func NewSqlDB(db *sqlx.DB) *SqlDB {
	return &SqlDB{DB: db}
}

type SqlDB struct {
	*sqlx.DB
}

func (db *SqlDB) BeginTx(ctx context.Context, opts *sql.TxOptions) (db.Transaction, error) {
	return db.BeginTxx(ctx, opts)
}
