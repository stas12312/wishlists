package config

import (
	"fmt"
	"github.com/gofiber/fiber/v2/log"
	"os"
	"regexp"
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

type Features struct {
	ConvertImageToWebp bool
}

func NewAppFeatures() Features {
	convertImageToWebp, _ := strconv.ParseBool(os.Getenv("CONVERT_IMAGE_TO_WEBP"))

	return Features{
		ConvertImageToWebp: convertImageToWebp,
	}
}

type Config struct {
	ImageMaxDownloadSize     int64
	TelegramBotToken         string
	TelegramBotUsername      string
	TelegramWebhookSecret    string
	ReservationCheckInterval time.Duration
	JWT                      JWTConfig
	S3                       S3Config
	Postgres                 PostgresConfig
	Environment              string
	Redis                    RedisConfig
	SMTP                     SMTPConfig
	BaseUrl                  string
	Feature                  Features
	ParseServiceUrl          string
}

func (c Config) IsTest() bool {

	return c.Environment == "test"
}

func NewConfig() *Config {
	telegramWebhookSecret := os.Getenv("TELEGRAM_WEBHOOK_SECRET")
	if telegramWebhookSecret != "" && !regexp.MustCompile(`^[A-Za-z0-9_-]{1,256}$`).MatchString(telegramWebhookSecret) {
		log.Panic("TELEGRAM_WEBHOOK_SECRET должен содержать от 1 до 256 символов: A-Z, a-z, 0-9, _ или -")
	}

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
	interval := time.Minute
	imageMaxDownloadSize := int64(5 * 1024 * 1024)
	if value := os.Getenv("IMAGE_MAX_DOWNLOAD_SIZE"); value != "" {
		parsed, err := strconv.ParseInt(value, 10, 64)
		if err != nil || parsed <= 0 || parsed > int64(^uint(0)>>1)-1024*1024 {
			log.Panic("IMAGE_MAX_DOWNLOAD_SIZE must be a positive number of bytes within the HTTP body size limit")
		}
		imageMaxDownloadSize = parsed
	}
	if value := os.Getenv("RESERVATION_CHECK_INTERVAL"); value != "" {
		parsed, err := time.ParseDuration(value)
		if err != nil || parsed < time.Second {
			log.Panic("RESERVATION_CHECK_INTERVAL must be a duration of at least 1s")
		}
		interval = parsed
	}
	return &Config{
		ImageMaxDownloadSize:     imageMaxDownloadSize,
		TelegramBotUsername:      os.Getenv("TELEGRAM_BOT_USERNAME"),
		TelegramBotToken:         os.Getenv("TELEGRAM_BOT_TOKEN"),
		TelegramWebhookSecret:    telegramWebhookSecret,
		ReservationCheckInterval: interval,
		JWT:                      jwt,
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
		Feature:         NewAppFeatures(),
		ParseServiceUrl: os.Getenv("PARSE_SERVICE_URL"),
	}

}
