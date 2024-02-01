package main

import (
	"encoding/json"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"main/config"
	"main/controller"
	database "main/db"
	repository "main/repository/impl"
	service "main/service/impl"
)

func main() {
	app := fiber.New(fiber.Config{
		JSONEncoder: json.Marshal,
		JSONDecoder: json.Unmarshal,
	})
	appConfig := config.NewConfig()

	app.Use(cors.New(
		cors.Config{
			AllowCredentials: true,
			AllowOriginsFunc: func(origin string) bool {
				return appConfig.Environment == "test"
			},
		},
	))

	db, err := sqlx.Connect("postgres", appConfig.PostgresUrl)
	if err != nil {
		log.Fatal(err)
	}

	if err := database.ExecMigrate(); err != nil {
		log.Info(err)
	}

	userRepository := repository.NewUserRepositoryImpl(db)
	userService := service.NewUserService(&userRepository)
	userController := controller.NewUserController(&userService, appConfig)

	api := app.Group("/api")

	userController.Route(api)
	log.Fatal(app.Listen(":8080"))
}
