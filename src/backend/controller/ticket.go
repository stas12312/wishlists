package controller

import (
	"main/middleware"
	"main/model"
	"main/service"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func NewTicketController(service service.TicketService) *TicketController {
	return &TicketController{service}
}

type TicketController struct {
	ticketService service.TicketService
}

func (c *TicketController) Create(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	ticket := &model.Ticket{}

	message := &model.Message{}

	err := ctx.BodyParser(ticket)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}
	err = ctx.BodyParser(message)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}

	ticket.AuthorId = userId
	createdTicket, err := c.ticketService.Create(ticket, message)
	if err != nil {
		return err
	}
	return ctx.JSON(model.Response{Data: createdTicket})
}

func (c *TicketController) List(ctx *fiber.Ctx) error {

	userId := GetUserIdFromCtx(ctx)
	tickets, err := c.ticketService.List(userId)

	if err != nil {
		return err
	}

	return ctx.JSON(model.Response{Data: tickets})
}

func (c *TicketController) ListCategories(ctx *fiber.Ctx) error {

	categories, _ := c.ticketService.ListCategory()

	return ctx.JSON(model.Response{Data: categories})
}

func (c *TicketController) Get(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	ticketId, _ := strconv.ParseInt(ctx.Params("id"), 10, 64)

	ticket, err := c.ticketService.Get(userId, ticketId)
	if err != nil {
		return err
	}
	return ctx.JSON(model.Response{Data: ticket})
}

func (c *TicketController) GetConversation(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	ticketId, _ := strconv.ParseInt(ctx.Params("id"), 10, 64)

	messages, err := c.ticketService.GetConversation(userId, ticketId)
	if err != nil {
		return err
	}

	return ctx.JSON(model.Response{Data: messages})

}

func (c *TicketController) AddMessage(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	ticketId, _ := strconv.ParseInt(ctx.Params("id"), 10, 64)
	message := &model.Message{}
	err := ctx.BodyParser(message)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}

	createdMessage, err := c.ticketService.AddMessage(userId, ticketId, message)
	if err != nil {
		return err
	}
	return ctx.JSON(model.Response{Data: createdMessage})
}

func (c *TicketController) Close(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	ticketId, _ := strconv.ParseInt(ctx.Params("id"), 10, 64)

	err := c.ticketService.Close(userId, ticketId)
	if err != nil {
		return err
	}

	return ctx.JSON(model.Response{Data: "ok"})
}

func (c *TicketController) Route(router fiber.Router) {

	group := router.Group("/tickets", middleware.Protected(true))

	categories := group.Group("/categories")
	categories.Get("/", c.ListCategories)

	group.Post("", c.Create)
	group.Get("", c.List)
	group.Get("/:id", c.Get)
	group.Post("/:id/close", c.Close)
	group.Get("/:id/conversation", c.GetConversation)
	group.Post("/:id/conversation", c.AddMessage)

}
