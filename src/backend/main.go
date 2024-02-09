package main

import (
	"encoding/json"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/google/uuid"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
	"main/config"
	"main/controller"
	database "main/db"
	"main/middleware"
	repository "main/repository/impl"
	service "main/service/impl"
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

	db, err := sqlx.Connect("pgx", appConfig.PostgresUrl)
	if err != nil {
		log.Info(appConfig.PostgresUrl)
		log.Fatal(err)
	}

	if err := database.ExecMigrate(); err != nil {
		log.Info(err)
	}

	userRepository := repository.NewUserRepositoryImpl(db)
	userService := service.NewUserService(userRepository)
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
