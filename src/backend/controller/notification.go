package controller

import (
	"main/middleware"
	"main/model"
	"main/service/impl"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

type NotificationController struct {
	service *impl.NotificationService
}

func NewNotificationController(service *impl.NotificationService) *NotificationController {
	return &NotificationController{service: service}
}

func (c *NotificationController) Route(router fiber.Router) {
	group := router.Group("/notifications", middleware.Protected(true))
	group.Get("/", c.list)
	group.Get("/unread", c.count)
	group.Put("/read", c.markAllRead)
	group.Put("/read/visible", c.markVisibleRead)
	group.Put("/read/events", c.markEventsRead)
	group.Get("/preferences/:kind", c.preferences)
	group.Put("/preferences/:kind/:channel", c.setPreference)
}

func (c *NotificationController) list(ctx *fiber.Ctx) error {
	before, err := strconv.ParseInt(ctx.Query("before", "0"), 10, 64)
	if err != nil || before < 0 {
		return notificationBadRequest(ctx)
	}
	items, next, err := c.service.List(GetUserIdFromCtx(ctx), before)
	if err != nil {
		return notificationFailure(ctx, err)
	}
	return ctx.JSON(model.Response{Data: fiber.Map{"items": items, "next": next}})
}

func (c *NotificationController) count(ctx *fiber.Ctx) error {
	count, err := c.service.CountUnread(GetUserIdFromCtx(ctx))
	if err != nil {
		return notificationFailure(ctx, err)
	}
	return ctx.JSON(model.Response{Data: fiber.Map{"count": count}})
}

func (c *NotificationController) markAllRead(ctx *fiber.Ctx) error {
	if err := c.service.MarkAllRead(GetUserIdFromCtx(ctx)); err != nil {
		return notificationFailure(ctx, err)
	}
	return ctx.SendStatus(fiber.StatusNoContent)
}

func (c *NotificationController) markVisibleRead(ctx *fiber.Ctx) error {
	var input struct {
		Ids []int64 `json:"ids"`
	}
	if ctx.BodyParser(&input) != nil || len(input.Ids) == 0 || len(input.Ids) > 500 {
		return notificationBadRequest(ctx)
	}
	if err := c.service.MarkVisibleRead(GetUserIdFromCtx(ctx), input.Ids); err != nil {
		return notificationFailure(ctx, err)
	}
	return ctx.SendStatus(fiber.StatusNoContent)
}

func (c *NotificationController) preferences(ctx *fiber.Ctx) error {
	kind := ctx.Params("kind")
	if !c.service.SupportsKind(kind) {
		return notificationBadRequest(ctx)
	}
	preferences, err := c.service.Preferences(GetUserIdFromCtx(ctx), kind)
	if err != nil {
		return notificationFailure(ctx, err)
	}
	return ctx.JSON(model.Response{Data: preferences})
}

func (c *NotificationController) setPreference(ctx *fiber.Ctx) error {
	kind, channel := ctx.Params("kind"), ctx.Params("channel")
	var input struct {
		Enabled *bool `json:"enabled"`
	}
	if !c.service.SupportsKind(kind) || channel != model.NotificationEmail ||
		ctx.BodyParser(&input) != nil || input.Enabled == nil {
		return notificationBadRequest(ctx)
	}
	if err := c.service.SetPreference(GetUserIdFromCtx(ctx), kind, channel, *input.Enabled); err != nil {
		return notificationFailure(ctx, err)
	}
	return ctx.SendStatus(fiber.StatusNoContent)
}

func (c *NotificationController) markEventsRead(ctx *fiber.Ctx) error {
	var input struct {
		Kind        string   `json:"kind"`
		ResourceKey string   `json:"resource_key"`
		EventKeys   []string `json:"event_keys"`
	}
	if ctx.BodyParser(&input) != nil || !c.service.SupportsKind(input.Kind) ||
		input.ResourceKey == "" || len(input.EventKeys) > 500 ||
		(input.EventKeys != nil && len(input.EventKeys) == 0) {
		return notificationBadRequest(ctx)
	}
	if err := c.service.MarkEventsRead(GetUserIdFromCtx(ctx), input.Kind, input.ResourceKey, input.EventKeys); err != nil {
		return notificationFailure(ctx, err)
	}
	return ctx.SendStatus(fiber.StatusNoContent)
}

func notificationBadRequest(ctx *fiber.Ctx) error {
	return ctx.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Message: "Некорректный запрос"})
}

func notificationFailure(ctx *fiber.Ctx, err error) error {
	log.Errorf("Ошибка работы с уведомлениями: %v", err)
	return ctx.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse{Message: "Не удалось обработать уведомления"})
}
