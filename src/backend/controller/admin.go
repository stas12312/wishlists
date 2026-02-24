package controller

import (
	"context"
	"main/middleware"
	"main/model"
	"main/service"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

func NewAdminController(userService service.UserService, articleService service.ArticleService) *AdminController {
	return &AdminController{userService: userService, articleService: articleService}
}

type AdminController struct {
	userService    service.UserService
	articleService service.ArticleService
}

func (c *AdminController) IsAdmin(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	user, err := c.userService.GetById(context.Background(), userId)
	if err != nil {
		return err
	}
	return ctx.JSON(model.Response{Data: fiber.Map{"is_admin": user.IsAdmin}})
}

func (c *AdminController) CreateArticle(ctx *fiber.Ctx) error {

	newArticle := new(model.Article)

	err := ctx.BodyParser(newArticle)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}

	createdArticle, err := c.articleService.Create(newArticle)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: err.Error()})
	}
	return ctx.JSON(model.Response{Data: createdArticle})
}

func (c *AdminController) DeleteArticle(ctx *fiber.Ctx) error {
	articleId, _ := strconv.ParseInt(ctx.Params("articleId"), 10, 64)
	err := c.articleService.Delete(articleId)

	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: err.Error()})
	}
	return ctx.JSON(model.Response{Data: "ok"})
}

func (c *AdminController) ListArticle(ctx *fiber.Ctx) error {

	navigation := &model.Navigation{}

	if err := ctx.QueryParser(navigation); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректная навигация", Details: err.Error()})
	}

	if len(navigation.Cursor) == 0 {
		navigation.Cursor = []string{"0"}
	}

	articles, err := c.articleService.List(&model.ArticleFilter{IsPublished: false}, navigation)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: err.Error()})
	}
	lastCreatedAt := ""
	if len(articles) > 0 {
		lastCreatedAt = articles[len(articles)-1].CreatedAt.Format(time.RFC3339Nano)
	}
	newNavigation := model.Navigation{Cursor: []string{lastCreatedAt}, Count: navigation.Count}

	return ctx.JSON(model.Response{Data: articles, Navigation: newNavigation})
}

func (c *AdminController) GetArticleById(ctx *fiber.Ctx) error {
	articleId, _ := strconv.ParseInt(ctx.Params("articleId"), 10, 64)

	article, err := c.articleService.GetById(articleId)

	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: err.Error()})
	}

	return ctx.JSON(model.Response{Data: article})
}

func (c *AdminController) Update(ctx *fiber.Ctx) error {

	articleId, _ := strconv.ParseInt(ctx.Params("articleId"), 10, 64)
	article := new(model.Article)
	err := ctx.BodyParser(article)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: err.Error()})
	}

	updatedArticle, err := c.articleService.Update(articleId, article)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: err.Error()})
	}
	return ctx.JSON(model.Response{Data: updatedArticle})
}

func (c *AdminController) Publish(ctx *fiber.Ctx) error {
	articleId, _ := strconv.ParseInt(ctx.Params("articleId"), 10, 64)
	_, err := c.articleService.Publish(articleId)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: err.Error()})
	}
	return ctx.JSON(model.Response{Data: "ok"})
}

func (c *AdminController) Unpublish(ctx *fiber.Ctx) error {
	articleId, _ := strconv.ParseInt(ctx.Params("articleId"), 10, 64)
	_, err := c.articleService.Unpublish(articleId)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: err.Error()})
	}
	return ctx.JSON(model.Response{Data: "ok"})
}

func (c *AdminController) Route(router fiber.Router) {

	adminGroup := router.Group("/admin", middleware.Protected(true))

	adminGroup.Get("/is", c.IsAdmin)

	articleGroup := adminGroup.Group("/articles", middleware.Protected(true), middleware.ForAdmin(c.userService))
	articleGroup.Post("/", c.CreateArticle)
	articleGroup.Get("/", c.ListArticle)
	articleGroup.Get("/:articleId", c.GetArticleById)
	articleGroup.Post("/:articleId", c.Update)
	articleGroup.Post("/:articleId/publish", c.Publish)
	articleGroup.Post("/:articleId/unpublish", c.Unpublish)
	articleGroup.Delete("/:articleId", c.DeleteArticle)

}
