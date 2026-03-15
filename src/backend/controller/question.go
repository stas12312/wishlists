package controller

import (
	"main/middleware"
	"main/model"
	"main/service"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

func NewQuestionController(service service.QuestionService) *QuestionController {
	return &QuestionController{service}
}

type QuestionController struct {
	service.QuestionService
}

func (c *QuestionController) Create(ctx *fiber.Ctx) error {

	createQuestion := &model.Question{}

	if err := ctx.BodyParser(createQuestion); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}
	if errs := NewValidator().Validate(createQuestion); len(errs) > 0 {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ValidateErrorResponse{Message: "Некорректно заполнены поля", Fields: errs})
	}

	userId := GetUserIdFromCtx(ctx)

	createdQuestion, err := c.QuestionService.Create(userId, createQuestion)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Ошибка", Details: err.Error()})
	}
	return ctx.JSON(model.Response{Data: createdQuestion})

}

func (c *QuestionController) ListForWish(ctx *fiber.Ctx) error {
	wishUUID := ctx.Params("uuid")
	userId := GetUserIdFromCtx(ctx)

	questions, err := c.QuestionService.ListByWishUUID(userId, wishUUID)

	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Ошибка", Details: err.Error()})
	}

	return ctx.JSON(model.Response{Data: questions})
}

func (c *QuestionController) ListMy(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	navigation := model.Navigation{}

	_ = ctx.QueryParser(&navigation)

	if len(navigation.Cursor) == 0 {
		navigation.Cursor = []string{""}
	}
	if (navigation.Count) > 100 || navigation.Count < 1 {
		navigation.Count = 20
	}

	questions, err := c.QuestionService.ListByAuthor(userId, navigation)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Ошибка", Details: err.Error()})
	}

	if len(questions) != 0 {
		navigation.Cursor = []string{questions[len(questions)-1].CreatedAt.Format(time.RFC3339Nano)}
	}

	return ctx.JSON(model.Response{Data: questions, Navigation: navigation})
}

func (c *QuestionController) ListForMe(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)

	navigation := model.Navigation{}
	_ = ctx.QueryParser(&navigation)

	if len(navigation.Cursor) == 0 {
		navigation.Cursor = []string{""}
	}
	if (navigation.Count) > 100 || navigation.Count < 1 {
		navigation.Count = 20
	}

	questions, err := c.QuestionService.ListByUser(userId, navigation)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Ошибка", Details: err.Error()})
	}

	if len(questions) != 0 {
		navigation.Cursor = []string{questions[len(questions)-1].CreatedAt.Format(time.RFC3339Nano)}
	}

	return ctx.JSON(model.Response{Data: questions, Navigation: navigation})
}

func (c *QuestionController) Answer(ctx *fiber.Ctx) error {
	type Request struct {
		Content string `json:"content"`
	}

	request := &Request{}
	if err := ctx.BodyParser(request); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}

	userId := GetUserIdFromCtx(ctx)
	questionId, _ := strconv.ParseInt(ctx.Params("id"), 10, 64)

	question, err := c.QuestionService.CreateAnswer(userId, questionId, request.Content)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Ошибка", Details: err.Error()})
	}

	return ctx.JSON(model.Response{Data: question})
}

func (c *QuestionController) Counters(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	waiting, answered, err := c.QuestionService.Counters(userId)

	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(model.ErrorResponse{Message: "Ошибка", Details: err.Error()})
	}

	return ctx.JSON(model.Response{Data: map[string]interface{}{"waiting": waiting, "answered": answered}})

}

func (c *QuestionController) DeleteQuestion(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	questionId, _ := strconv.ParseInt(ctx.Params("id"), 10, 64)

	err := c.QuestionService.DeleteQuestion(userId, questionId)
	if err != nil {
		return err
	}
	return ctx.JSON(model.Response{Data: "OK"})
}

func (c *QuestionController) DeleteAnswer(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	questionId, _ := strconv.ParseInt(ctx.Params("id"), 10, 64)

	question, err := c.QuestionService.DeleteAnswer(userId, questionId)
	if err != nil {
		return err
	}

	return ctx.JSON(model.Response{Data: question})
}
func (c *QuestionController) CloseQuestions(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	type Request struct {
		Ids []int64 `json:"ids"`
	}

	request := &Request{}
	if err := ctx.BodyParser(request); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Некорректный запрос", Details: err.Error()})
	}

	err := c.QuestionService.MarkClosed(userId, request.Ids)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Не удалось закрыть вопросы", Details: err.Error()})
	}
	return ctx.JSON(model.Response{Data: "OK"})
}

func (c *QuestionController) Route(router fiber.Router) {

	group := router.Group("/questions")
	group.Post("/", middleware.Protected(true), c.Create)
	group.Get("/", middleware.Protected(true), c.ListMy)
	group.Delete("/:id", middleware.Protected(true), c.DeleteQuestion)
	group.Post("/:id/answer", middleware.Protected(true), c.Answer)
	group.Delete("/:id/answer", middleware.Protected(true), c.DeleteAnswer)
	group.Get("/for-me", middleware.Protected(true), c.ListForMe)
	group.Get("/counters", middleware.Protected(true), c.Counters)
	group.Post("/close", middleware.Protected(true), c.CloseQuestions)

	router.Get("/wishes/:uuid/questions", middleware.Protected(false), c.ListForWish)
}
