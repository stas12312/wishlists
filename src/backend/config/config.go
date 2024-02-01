package config

import (
	"os"
	"strconv"
	"time"
)

type JWTConfig struct {
	AccessSecretKey  string
	AccessExpireTime time.Duration

	RefreshSecretKey  string
	RefreshExpireTime time.Duration
}

type Config struct {
	JWT         JWTConfig
	PostgresUrl string

	Environment string
}

func NewConfig() *Config {

	accessExpireTime, _ := strconv.ParseInt(os.Getenv("JWT_ACCESS_SECRET_KEY_EXPIRE"), 10, 64)
	refreshExpireTime, _ := strconv.ParseInt(os.Getenv("JWT_REFRESH_SECRET_KEY_EXPIRE"), 10, 64)

	jwt := JWTConfig{
		AccessSecretKey:   os.Getenv("JWT_ACCESS_SECRET_KEY"),
		AccessExpireTime:  time.Duration(accessExpireTime),
		RefreshSecretKey:  os.Getenv("JWT_REFRESH_SECRET_KEY"),
		RefreshExpireTime: time.Duration(refreshExpireTime),
	}

	return &Config{
		JWT:         jwt,
		PostgresUrl: os.Getenv("POSTGRES_URL"),
		Environment: os.Getenv("ENVIRONMENT"),
	}

}
