package main

import (
	"encoding/json"
	"main/config"
	"main/controller"
	database "main/db"
	"main/db/sqlx_db"
	apperror "main/error"
	"main/mail/impl"
	"main/middleware"
	"main/oauth"
	"main/oauth/yandex"
	repository "main/repository/impl"
	service "main/service/impl"
	impl2 "main/uof/impl"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/pprof"
	"github.com/google/uuid"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

func main() {
	app := fiber.New(fiber.Config{
		JSONEncoder:  json.Marshal,
		JSONDecoder:  json.Unmarshal,
		ErrorHandler: apperror.AppErrorHandler,
	})

	appConfig := config.NewConfig()

	setupMiddlewares(app, appConfig)

	db, _ := initDb(appConfig)

	redisClient := redis.NewClient(&redis.Options{
		Addr: appConfig.Redis.Address,
	})

	yandexOauthClient := yandex.NewYandexFromEnv()
	oAuthManager := oauth.NewManager(yandexOauthClient)

	postgresDB := sqlx_db.NewSqlDB(db)
	uof := impl2.NewUnitOfWorkPostgres(postgresDB, impl2.StoreFactory)

	websocketService := service.NewWsImpl()
	websocketController := controller.NewWebSocketController(websocketService)

	codeRepository := repository.NewConfirmCodeRedis(redisClient, 60*time.Minute)
	mailClient := impl.NewSMPTClient(&appConfig.SMTP)
	userService := service.NewUserService(uof, codeRepository, mailClient, appConfig, oAuthManager)
	userController := controller.NewUserController(&userService, appConfig)

	friendRepository := repository.NewFriendRepositoryPostgres(db)
	friendService := service.NewFriendService(friendRepository, uof, websocketService)
	friendController := controller.NewFriendController(friendService, userService)

	wishlistRepository := repository.NewWishlistRepository(db)
	wishRepository := repository.NewWishRepositoryImpl(db)
	wishlistService := service.NewWishlistService(
		wishlistRepository,
		wishRepository,
		userService,
		friendService,
		websocketService,
	)
	wishlistController := controller.NewWishlistController(&wishlistService, appConfig)

	imageRepository := repository.NewS3ImageRepository(&appConfig.S3)
	imageService := service.NewImageService(imageRepository, uuid.NewString, appConfig.Feature)
	imageController := controller.NewImageController(imageService)

	feedRepository := repository.NewFeedRepositoryPostgres(db)
	feedService := service.NewFeedService(feedRepository)
	feedController := controller.NewFeedController(feedService)

	api := app.Group("/api")

	websocketController.Route(app)
	userController.Route(api)
	wishlistController.Route(api)
	imageController.Route(api)
	friendController.Route(api)
	feedController.Route(api)

	log.Fatal(app.Listen(":8080"))
}

func setupMiddlewares(app *fiber.App, config *config.Config) {
	app.Use(middleware.NewTimer())

	app.Use(cors.New(
		cors.Config{
			AllowCredentials: true,
			AllowOriginsFunc: func(origin string) bool {
				return config.IsTest()
			},
		},
	))

	if config.IsTest() {
		app.Use(pprof.New())
	}
}

func initDb(config *config.Config) (*sqlx.DB, error) {
	db, err := sqlx.Connect("pgx", config.Postgres.Url)
	if err != nil {
		log.Info(config.Postgres.Url)
		log.Fatal(err)
	}

	if err = database.ExecMigrate(config); err != nil {
		log.Info(err)
	}
	return db, err
}
