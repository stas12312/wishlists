package controller

import (
	"context"
	"fmt"
	"main/config"
	"main/middleware"
	"main/model"
	"main/service"
	"net/url"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

func NewAdminController(userService service.UserService, articleService service.ArticleService, ticketService service.TicketService, mailLogService service.MailLogService, config *config.Config) *AdminController {
	return &AdminController{userService: userService, articleService: articleService, ticketService: ticketService, mailLogService: mailLogService, config: config}
}

type AdminController struct {
	userService    service.UserService
	articleService service.ArticleService
	ticketService  service.TicketService
	mailLogService service.MailLogService
	config         *config.Config
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

func (c *AdminController) CreateCategory(ctx *fiber.Ctx) error {

	categoryForCreate := &model.TicketCategory{}

	err := ctx.BodyParser(categoryForCreate)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}

	newCategory, err := c.ticketService.CreateCategory(categoryForCreate)
	if err != nil {
		return err
	}
	return ctx.JSON(model.Response{Data: newCategory})
}

func (c *AdminController) ListCategories(ctx *fiber.Ctx) error {

	categories, _ := c.ticketService.ListCategory()

	return ctx.JSON(model.Response{Data: categories})
}

func (c *AdminController) ListTickets(ctx *fiber.Ctx) error {
	navigation := model.Navigation{}
	filters := model.TicketFilters{}

	err := ctx.QueryParser(&navigation)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Некорректная навигация", Details: err.Error()})
	}

	if navigation.Count < 1 || navigation.Count > 50 {
		navigation.Count = 50
	}

	if len(navigation.Cursor) < 1 {
		navigation.Cursor = []string{""}
	}
	tickets, err := c.ticketService.List(0, navigation, filters)

	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: err.Error()})
	}

	if len(tickets) > 0 {
		navigation.Cursor = []string{tickets[len(tickets)-1].CreatedAt.Format(time.RFC3339Nano)}
	}

	return ctx.JSON(model.Response{Data: tickets, Navigation: navigation})
}

func (c *AdminController) GetTicket(ctx *fiber.Ctx) error {
	id, _ := strconv.ParseInt(ctx.Params("id"), 10, 64)
	ticket, err := c.ticketService.Get(0, id)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: err.Error()})
	}
	return ctx.JSON(model.Response{Data: ticket})
}

func (c *AdminController) GetTicketConversation(ctx *fiber.Ctx) error {
	id, _ := strconv.ParseInt(ctx.Params("id"), 10, 64)
	messages, err := c.ticketService.GetConversation(0, id)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: err.Error()})
	}
	return ctx.JSON(model.Response{Data: messages})
}

func (c *AdminController) AddTicketMessage(ctx *fiber.Ctx) error {
	id, _ := strconv.ParseInt(ctx.Params("id"), 10, 64)
	userId := GetUserIdFromCtx(ctx)
	message := &model.Message{}
	err := ctx.BodyParser(message)
	messages, err := c.ticketService.AddMessageFromAdmin(userId, id, message)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: err.Error()})
	}
	return ctx.JSON(model.Response{Data: messages})
}

func (c *AdminController) ListMailLogs(ctx *fiber.Ctx) error {
	navigation := model.Navigation{}
	filters := model.MailLogFilters{}

	if err := ctx.QueryParser(&navigation); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Некорректная навигация", Details: err.Error()})
	}
	if err := ctx.QueryParser(&filters); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Некорректные фильтры", Details: err.Error()})
	}

	switch filters.Status {
	case "", model.MailStatusPending, model.MailStatusSent, model.MailStatusFailed:
	default:
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Некорректный статус"})
	}

	if navigation.Count < 1 || navigation.Count > 50 {
		navigation.Count = 50
	}
	if len(navigation.Cursor) < 1 {
		navigation.Cursor = []string{""}
	}
	if _, err := strconv.ParseInt(navigation.Cursor[0], 10, 64); navigation.Cursor[0] != "" && err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Некорректная навигация", Details: err.Error()})
	}

	mailLogs, err := c.mailLogService.List(filters, navigation)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: err.Error()})
	}

	if len(mailLogs) > 0 {
		navigation.Cursor = []string{strconv.FormatInt(mailLogs[len(mailLogs)-1].Id, 10)}
	}

	return ctx.JSON(model.Response{Data: mailLogs, Navigation: navigation})
}

func (c *AdminController) GetMailLog(ctx *fiber.Ctx) error {
	id, _ := strconv.ParseInt(ctx.Params("id"), 10, 64)
	mailLog, err := c.mailLogService.Get(id)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(model.ErrorResponse{Message: "Письмо не найдено"})
	}
	return ctx.JSON(model.Response{Data: mailLog})
}

func (c *AdminController) ClearMailBodies(ctx *fiber.Ctx) error {
	cleared, err := c.mailLogService.ClearOldBodies()
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: err.Error()})
	}
	return ctx.JSON(model.Response{Data: fiber.Map{"cleared": cleared}})
}

func (c *AdminController) GetParseStatus(ctx *fiber.Ctx) error {
	return proxyToParseService(ctx, c.config.ParseServiceUrl, "/status")
}

func (c *AdminController) GetParseShops(ctx *fiber.Ctx) error {
	return proxyToParseService(ctx, c.config.ParseServiceUrl, "/status/shops")
}

func (c *AdminController) GetParseStats(ctx *fiber.Ctx) error {
	return proxyToParseService(ctx, c.config.ParseServiceUrl, "/stats")
}

func (c *AdminController) GetParseEvents(ctx *fiber.Ctx) error {
	return proxyToParseService(ctx, c.config.ParseServiceUrl, "/stats/events")
}

func (c *AdminController) GetParseEventScreenshot(ctx *fiber.Ctx) error {
	taskId := url.PathEscape(ctx.Params("task_id"))
	return proxyToParseService(ctx, c.config.ParseServiceUrl, fmt.Sprintf("/stats/events/%s/screenshot", taskId))
}

func (c *AdminController) GetParseEventTraceback(ctx *fiber.Ctx) error {
	taskId := url.PathEscape(ctx.Params("task_id"))
	return proxyToParseService(ctx, c.config.ParseServiceUrl, fmt.Sprintf("/stats/events/%s/traceback", taskId))
}

func (c *AdminController) GetParseEventResponse(ctx *fiber.Ctx) error {
	taskId := url.PathEscape(ctx.Params("task_id"))
	return proxyToParseService(ctx, c.config.ParseServiceUrl, fmt.Sprintf("/stats/events/%s/response", taskId))
}

func (c *AdminController) GetParseProxies(ctx *fiber.Ctx) error {
	return proxyToParseService(ctx, c.config.ParseServiceUrl, "/proxies")
}

func (c *AdminController) AddParseProxy(ctx *fiber.Ctx) error {
	return proxyToParseService(ctx, c.config.ParseServiceUrl, "/proxies")
}

func (c *AdminController) RotateParseProxy(ctx *fiber.Ctx) error {
	return proxyToParseService(ctx, c.config.ParseServiceUrl, "/proxies/rotate")
}

func (c *AdminController) ActivateParseProxy(ctx *fiber.Ctx) error {
	proxyId := url.PathEscape(ctx.Params("proxy_id"))
	return proxyToParseService(ctx, c.config.ParseServiceUrl, fmt.Sprintf("/proxies/%s/activate", proxyId))
}

func (c *AdminController) CheckParseProxy(ctx *fiber.Ctx) error {
	proxyId := url.PathEscape(ctx.Params("proxy_id"))
	return proxyToParseService(ctx, c.config.ParseServiceUrl, fmt.Sprintf("/proxies/%s/check", proxyId))
}

func (c *AdminController) DeleteParseProxy(ctx *fiber.Ctx) error {
	proxyId := url.PathEscape(ctx.Params("proxy_id"))
	return proxyToParseService(ctx, c.config.ParseServiceUrl, fmt.Sprintf("/proxies/%s", proxyId))
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

	ticketsGroup := adminGroup.Group("/tickets", middleware.Protected(true), middleware.ForAdmin(c.userService))
	ticketsGroup.Get("/", c.ListTickets)
	ticketsGroup.Get("/:id", c.GetTicket)
	ticketsGroup.Get("/:id/conversation", c.GetTicketConversation)
	ticketsGroup.Post("/:id/conversation", c.AddTicketMessage)

	categoriesGroup := ticketsGroup.Group("/categories")
	categoriesGroup.Post("/", c.CreateCategory)
	categoriesGroup.Get("/", c.ListCategories)

	mailsGroup := adminGroup.Group("/mails", middleware.ForAdmin(c.userService))
	mailsGroup.Get("/", c.ListMailLogs)
	mailsGroup.Post("/clear", c.ClearMailBodies)
	mailsGroup.Get("/:id", c.GetMailLog)

	parseGroup := adminGroup.Group("/parse", middleware.ForAdmin(c.userService))
	parseGroup.Get("/status", c.GetParseStatus)
	parseGroup.Get("/shops", c.GetParseShops)
	parseGroup.Get("/stats", c.GetParseStats)
	parseGroup.Get("/events", c.GetParseEvents)
	parseGroup.Get("/events/:task_id/screenshot", c.GetParseEventScreenshot)
	parseGroup.Get("/events/:task_id/traceback", c.GetParseEventTraceback)
	parseGroup.Get("/events/:task_id/response", c.GetParseEventResponse)
	parseGroup.Get("/proxies", c.GetParseProxies)
	parseGroup.Post("/proxies", c.AddParseProxy)
	parseGroup.Post("/proxies/rotate", c.RotateParseProxy)
	parseGroup.Post("/proxies/:proxy_id/activate", c.ActivateParseProxy)
	parseGroup.Post("/proxies/:proxy_id/check", c.CheckParseProxy)
	parseGroup.Delete("/proxies/:proxy_id", c.DeleteParseProxy)

}
