package controller

import (
	"context"
	"errors"
	apperror "main/error"
	"main/middleware"
	"main/model"
	"main/service"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

const telegramJournalPageSize = 50

type TelegramJournalReader interface {
	Chats(context.Context, *int64, *int64, int) ([]model.TelegramChat, error)
	Messages(context.Context, int64, *int64, int) ([]model.TelegramMessage, error)
}

type TelegramJournalController struct {
	users   service.UserService
	journal TelegramJournalReader
}

func NewTelegramJournalController(users service.UserService, journal TelegramJournalReader) *TelegramJournalController {
	return &TelegramJournalController{users: users, journal: journal}
}

func (c *TelegramJournalController) ListChats(ctx *fiber.Ctx) error {
	chatID, err := telegramJournalID(ctx.Query("chat_id"))
	if err != nil {
		return err
	}
	before, err := telegramJournalID(ctx.Query("before"))
	if err != nil {
		return err
	}
	rows, err := c.journal.Chats(ctx.UserContext(), chatID, before, telegramJournalPageSize+1)
	if err != nil {
		return telegramJournalError(err)
	}
	return telegramJournalPage(ctx, rows, func(row model.TelegramChat) string { return row.ChatID })
}

func (c *TelegramJournalController) ListMessages(ctx *fiber.Ctx) error {
	chatID, err := telegramJournalID(ctx.Params("chatID"))
	if err != nil || chatID == nil {
		return apperror.NewError(apperror.WrongRequest, "Некорректный chat_id")
	}
	before, err := telegramJournalID(ctx.Query("before"))
	if err != nil {
		return err
	}
	rows, err := c.journal.Messages(ctx.UserContext(), *chatID, before, telegramJournalPageSize+1)
	if err != nil {
		return telegramJournalError(err)
	}
	return telegramJournalPage(ctx, rows, func(row model.TelegramMessage) string { return row.ID })
}

func (c *TelegramJournalController) Route(router fiber.Router) {
	group := router.Group("/admin/telegram", middleware.Protected(true), middleware.ForAdmin(c.users))
	group.Get("/chats", c.ListChats)
	group.Get("/chats/:chatID/messages", c.ListMessages)
}

func telegramJournalPage[T any](ctx *fiber.Ctx, rows []T, id func(T) string) error {
	next := ""
	if len(rows) > telegramJournalPageSize {
		rows = rows[:telegramJournalPageSize]
		next = id(rows[len(rows)-1])
	}
	ctx.Set("Cache-Control", "no-store")
	return ctx.JSON(struct {
		Data []T    `json:"data"`
		Next string `json:"next,omitempty"`
	}{Data: rows, Next: next})
}

func telegramJournalID(value string) (*int64, error) {
	if value == "" {
		return nil, nil
	}
	id, err := strconv.ParseInt(value, 10, 64)
	if err != nil || id == 0 {
		return nil, apperror.NewError(apperror.WrongRequest, "Некорректный идентификатор")
	}
	return &id, nil
}

func telegramJournalError(err error) error {
	log.Error(err)
	return errors.New("Не удалось загрузить журнал Telegram")
}
