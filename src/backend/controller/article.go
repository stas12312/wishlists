package controller

import (
	"main/model"
	"main/service"
	"time"

	"github.com/gofiber/fiber/v2"
)

func NewArticleController(articleService service.ArticleService) ArticleController {
	return ArticleController{
		articleService,
	}
}

type ArticleController struct {
	service service.ArticleService
}

func (c *ArticleController) GetBySlug(ctx *fiber.Ctx) error {
	slug := ctx.Params("slug")
	article, err := c.service.GetBySlug(slug)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).
			JSON(model.ErrorResponse{Message: "Запись не найдена", Details: err.Error()})
	}
	return ctx.JSON(model.Response{Data: article})
}

func (c *ArticleController) GetAll(ctx *fiber.Ctx) error {

	navigation := &model.Navigation{}
	err := ctx.QueryParser(navigation)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректные параметры", Details: err.Error()})
	}
	if navigation.Count > 100 {
		navigation.Count = 100
	}
	if len(navigation.Cursor) == 0 {
		navigation.Cursor = []string{""}
	}

	articles, err := c.service.List(&model.ArticleFilter{IsPublished: true}, navigation)

	lastPublishedAt := ""
	if len(articles) > 0 {
		lastPublishedAt = articles[len(articles)-1].PublishedAt.Time.Format(time.RFC3339Nano)
	}

	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Ошибка при получении", Details: err.Error()})
	}

	return ctx.JSON(model.Response{
		Data:       articles,
		Navigation: model.Navigation{Count: navigation.Count, Cursor: []string{lastPublishedAt}},
	})

}

func (c *ArticleController) Route(router fiber.Router) {
	group := router.Group("/articles")
	group.Get("/", c.GetAll)
	group.Get("/:slug", c.GetBySlug)
}
