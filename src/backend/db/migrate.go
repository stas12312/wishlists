package db

import (
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"main/config"
)

func ExecMigrate(config *config.Config) error {
	m, err := migrate.New(
		"file://./db/migrations",
		config.Postgres.Url,
	)
	if err != nil {
		return err
	}
	return m.Up()
}
