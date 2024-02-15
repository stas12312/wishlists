package main

import (
	"context"
	"encoding/json"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/google/uuid"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"main/config"
	"main/controller"
	database "main/db"
	"main/mail/impl"
	"main/middleware"
	repository "main/repository/impl"
	service "main/service/impl"
	"time"
)

func main() {
	app := fiber.New(fiber.Config{
		JSONEncoder: json.Marshal,
		JSONDecoder: json.Unmarshal,
	})

	app.Use(middleware.NewTimer())

	appConfig := config.NewConfig()

	app.Use(cors.New(
		cors.Config{
			AllowCredentials: true,
			AllowOriginsFunc: func(origin string) bool {
				return appConfig.Environment == "test"
			},
		},
	))

	db, err := sqlx.Connect("pgx", appConfig.Postgres.Url)
	if err != nil {
		log.Info(appConfig.Postgres.Url)
		log.Fatal(err)
	}

	if err := database.ExecMigrate(appConfig); err != nil {
		log.Info(err)
	}

	redisClient := redis.NewClient(&redis.Options{
		Addr: appConfig.Redis.Address,
	})

	log.Info(redisClient.Info(context.Background(), "server").Result())

	userRepository := repository.NewUserRepositoryImpl(db)
	confirmCoreRepository := repository.NewConfirmCodeRedis(redisClient, 30*time.Minute)
	mailClient := impl.NewSMPTClient(&appConfig.SMTP)
	userService := service.NewUserService(userRepository, confirmCoreRepository, mailClient, appConfig)
	userController := controller.NewUserController(&userService, appConfig)

	wishlistRepository := repository.NewWishlistRepository(db)
	wishRepository := repository.NewWishRepositoryImpl(db)
	wishlistService := service.NewWishlistService(wishlistRepository, wishRepository)
	wishlistController := controller.NewWishlistController(&wishlistService, appConfig)

	imageRepository := repository.NewS3ImageRepository(&appConfig.S3)
	imageService := service.NewImageService(imageRepository, uuid.NewString)
	imageController := controller.NewImageController(imageService)

	api := app.Group("/api")

	userController.Route(api)
	wishlistController.Route(api)
	imageController.Route(api)

	log.Fatal(app.Listen(":8080"))
}
