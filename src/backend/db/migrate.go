package db

import (
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"os"
)

func ExecMigrate() error {
	m, err := migrate.New(
		"file://./db/migrations",
		os.Getenv("POSTGRES_URL"))
	if err != nil {
		return err
	}
	return m.Up()
}
