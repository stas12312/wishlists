package controller

import (
	"crypto/subtle"
	apperror "main/error"
	"main/service"
	"main/telegram"

	"github.com/gofiber/fiber/v2"
)

type TelegramBotController struct {
	service service.TelegramBotService
	secret  string
}

func NewTelegramBotController(service service.TelegramBotService, secret string) *TelegramBotController {
	return &TelegramBotController{service: service, secret: secret}
}

func (c *TelegramBotController) Webhook(ctx *fiber.Ctx) error {
	header := ctx.Get("X-Telegram-Bot-Api-Secret-Token")
	token := ctx.Params("token")
	if c.secret == "" || subtle.ConstantTimeCompare([]byte(token), []byte(c.secret)) != 1 || subtle.ConstantTimeCompare([]byte(header), []byte(c.secret)) != 1 {
		return ctx.SendStatus(fiber.StatusForbidden)
	}
	update := new(telegram.Update)
	if err := ctx.BodyParser(update); err != nil {
		return apperror.NewError(apperror.WrongRequest, "Некорректное обновление Telegram")
	}
	if err := c.service.HandleUpdate(ctx.UserContext(), *update); err != nil {
		return err
	}
	return ctx.SendStatus(fiber.StatusOK)
}

func (c *TelegramBotController) Route(router fiber.Router) {
	router.Post("/webhook/telegram/:token", c.Webhook)
}
