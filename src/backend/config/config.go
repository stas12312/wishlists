package config

import (
	"fmt"
	"github.com/gofiber/fiber/v2/log"
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

func NewPostgresConfig(pgHost, pgDatabase, pgUser, pgPassword, pgPort string) PostgresConfig {

	converterPgPort, err := strconv.Atoi(pgPort)
	postgresUrl := fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=disable",
		pgUser, pgPassword, pgHost, converterPgPort, pgDatabase,
	)
	if err != nil {
		log.Panic(err.Error())
	}

	return PostgresConfig{
		Host:     pgHost,
		Database: pgDatabase,
		User:     pgUser,
		Password: pgPassword,
		Port:     converterPgPort,
		Url:      postgresUrl,
	}
}

type PostgresConfig struct {
	Host     string
	Database string
	User     string
	Password string
	Port     int
	Url      string
}

func NewRedisConfig(host string, port int) RedisConfig {
	address := fmt.Sprintf("%s:%d", host, port)
	return RedisConfig{
		Port:    port,
		Host:    host,
		Address: address,
	}
}

type SMTPConfig struct {
	Host     string
	Port     int
	Username string
	Password string
	From     string
}

type RedisConfig struct {
	Host    string
	Port    int
	Address string
}

type Config struct {
	JWT         JWTConfig
	S3          S3Config
	Postgres    PostgresConfig
	Environment string
	Redis       RedisConfig
	SMTP        SMTPConfig
	BaseUrl     string
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

	redisPort, _ := strconv.ParseInt(os.Getenv("REDIS_PORT"), 10, 64)
	smtpPort, _ := strconv.ParseInt(os.Getenv("SMTP_PORT"), 10, 64)
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
		BaseUrl: os.Getenv("BASE_URL"),
		Postgres: NewPostgresConfig(
			os.Getenv("PG_HOST"), os.Getenv("PG_DATABASE"), os.Getenv("PG_USER"),
			os.Getenv("PG_PASSWORD"), os.Getenv("PG_PORT"),
		),
		Environment: os.Getenv("ENVIRONMENT"),
		Redis:       NewRedisConfig(os.Getenv("REDIS_HOST"), int(redisPort)),
		SMTP: SMTPConfig{
			Host:     os.Getenv("SMTP_HOST"),
			Port:     int(smtpPort),
			Username: os.Getenv("SMTP_USERNAME"),
			Password: os.Getenv("SMTP_PASSWORD"),
			From:     os.Getenv("SMTP_FROM"),
		},
	}

}
