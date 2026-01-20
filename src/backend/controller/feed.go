package controller

import (
	"main/middleware"
	"main/model"
	"main/service"
	"time"

	"github.com/gofiber/fiber/v2"
)

func NewFeedController(service service.FeedService) *FeedController {
	return &FeedController{
		service,
	}
}

type FeedController struct {
	service service.FeedService
}

func (c *FeedController) Get(ctx *fiber.Ctx) error {

	userId := GetUserIdFromCtx(ctx)
	navigation := &model.Navigation{}

	if err := ctx.QueryParser(navigation); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректная навигация", Details: err.Error()})
	}

	if navigation.Count > 50 || navigation.Count == 0 {
		navigation.Count = 50
	}
	if navigation.Cursor == nil || len(navigation.Cursor) == 0 {
		navigation.Cursor = []string{"", ""}
	}

	feed, err := c.service.Get(userId, navigation)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).
			JSON(model.ErrorResponse{Message: "Ошибка при получении ленты", Details: err.Error()})
	}
	lastFeed := model.Wish{}
	if len(feed) > 0 {
		lastFeed = feed[len(feed)-1]
	}

	createdAt := lastFeed.CreatedAt.Time.Format(time.RFC3339)
	return ctx.JSON(model.Response{Data: feed,
		Navigation: model.Navigation{Cursor: []string{createdAt, lastFeed.Uuid}}},
	)
}

func (c *FeedController) Route(router fiber.Router) {

	group := router.Group("/feed", middleware.Protected(true))

	group.Get("/", c.Get)
}
