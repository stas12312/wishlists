package controller

import (
	"main/config"
	apperror "main/error"
	"main/middleware"
	"main/model"
	"main/service"

	"github.com/gofiber/fiber/v2"
)

func NewTelegramController(telegramService service.TelegramService, cfg *config.Config) *TelegramController {
	return &TelegramController{service: telegramService, config: cfg}
}

type TelegramController struct {
	service service.TelegramService
	config  *config.Config
}

type telegramRequest struct {
	InitData string `json:"init_data"`
}

func parseTelegramRequest(ctx *fiber.Ctx) (*telegramRequest, error) {
	request := new(telegramRequest)
	if err := ctx.BodyParser(request); err != nil || request.InitData == "" || len(request.InitData) > 16384 {
		return nil, apperror.NewError(apperror.WrongRequest, "Некорректные данные Telegram")
	}
	return request, nil
}

func (c *TelegramController) Authenticate(ctx *fiber.Ctx) error {
	ctx.Set(fiber.HeaderCacheControl, "no-store")
	request, err := parseTelegramRequest(ctx)
	if err != nil {
		return err
	}
	user, err := c.service.Authenticate(ctx.UserContext(), request.InitData)
	if err != nil {
		return err
	}
	if user == nil {
		return ctx.JSON(fiber.Map{"linked": false})
	}
	return c.respondWithSession(ctx, user)
}

func (c *TelegramController) Register(ctx *fiber.Ctx) error {
	ctx.Set(fiber.HeaderCacheControl, "no-store")
	request, err := parseTelegramRequest(ctx)
	if err != nil {
		return err
	}
	user, err := c.service.Register(ctx.UserContext(), request.InitData)
	if err != nil {
		return err
	}
	return c.respondWithSession(ctx, user)
}

func (c *TelegramController) respondWithSession(ctx *fiber.Ctx, user *model.User) error {
	tokens := makeTokenPair(user.Id, user.Email, &c.config.JWT)
	SetRefreshToken(ctx, tokens.RefreshToken, c.config)
	return ctx.JSON(struct {
		Linked bool `json:"linked"`
		model.TokenPariResponse
	}{Linked: true, TokenPariResponse: tokens})
}

func (c *TelegramController) Link(ctx *fiber.Ctx) error {
	ctx.Set(fiber.HeaderCacheControl, "no-store")
	request, err := parseTelegramRequest(ctx)
	if err != nil {
		return err
	}
	_, err = c.service.Link(ctx.UserContext(), GetUserIdFromCtx(ctx), request.InitData)
	if err != nil {
		return err
	}
	return ctx.JSON(fiber.Map{"linked": true})
}

func (c *TelegramController) Route(router fiber.Router) {
	telegram := router.Group("/auth/telegram")
	telegram.Post("/", c.Authenticate)
	telegram.Post("/register", c.Register)
	telegram.Post("/link", middleware.Protected(true), c.Link)
}
