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

type S3Config struct {
	AccessKey       string
	SecretAccessKey string
	Region          string
	EndpointUrl     string
	Bucket          string
	Domain          string
}

type Config struct {
	JWT         JWTConfig
	S3          S3Config
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
		JWT: jwt,
		S3: S3Config{
			AccessKey:       os.Getenv("S3_ACCESS_KEY"),
			SecretAccessKey: os.Getenv("S3_SECRET_ACCESS_KEY"),
			Region:          os.Getenv("S3_REGION"),
			EndpointUrl:     os.Getenv("S3_ENDPOINT_URL"),
			Bucket:          os.Getenv("S3_BUCKET"),
			Domain:          os.Getenv("S3_DOMAIN"),
		},
		PostgresUrl: os.Getenv("POSTGRES_URL"),
		Environment: os.Getenv("ENVIRONMENT"),
	}

}
