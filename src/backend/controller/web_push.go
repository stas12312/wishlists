package controller

import (
	"errors"
	"main/model"
	"main/service/impl"

	"github.com/gofiber/fiber/v2"
)

func (c *NotificationController) pushKey(ctx *fiber.Ctx) error {
	ctx.Set(fiber.HeaderCacheControl, "no-store")
	return ctx.JSON(model.Response{Data: fiber.Map{"public_key": c.service.PushPublicKey()}})
}

func (c *NotificationController) pushStatus(ctx *fiber.Ctx) error {
	var input struct {
		Endpoint string `json:"endpoint"`
	}
	if ctx.BodyParser(&input) != nil {
		return notificationBadRequest(ctx)
	}
	linked, err := c.service.HasPushSubscription(GetUserIdFromCtx(ctx), input.Endpoint)
	if err != nil {
		return pushSubscriptionFailure(ctx, err)
	}
	return ctx.JSON(model.Response{Data: fiber.Map{"linked": linked}})
}

func (c *NotificationController) savePushSubscription(ctx *fiber.Ctx) error {
	if c.service.PushPublicKey() == "" {
		return ctx.SendStatus(fiber.StatusServiceUnavailable)
	}
	var input struct {
		Endpoint string `json:"endpoint"`
		Keys     struct {
			Auth   string `json:"auth"`
			P256dh string `json:"p256dh"`
		} `json:"keys"`
	}
	if ctx.BodyParser(&input) != nil {
		return notificationBadRequest(ctx)
	}
	saved, err := c.service.SavePushSubscription(GetUserIdFromCtx(ctx), model.PushSubscription{
		Endpoint: input.Endpoint, Auth: input.Keys.Auth, P256dh: input.Keys.P256dh,
	})
	if err != nil {
		return pushSubscriptionFailure(ctx, err)
	}
	if !saved {
		return ctx.SendStatus(fiber.StatusConflict)
	}
	return ctx.SendStatus(fiber.StatusNoContent)
}

func (c *NotificationController) deletePushSubscription(ctx *fiber.Ctx) error {
	var input struct {
		Endpoint string `json:"endpoint"`
	}
	if ctx.BodyParser(&input) != nil {
		return notificationBadRequest(ctx)
	}
	if err := c.service.DeletePushSubscription(GetUserIdFromCtx(ctx), input.Endpoint); err != nil {
		return pushSubscriptionFailure(ctx, err)
	}
	return ctx.SendStatus(fiber.StatusNoContent)
}

func pushSubscriptionFailure(ctx *fiber.Ctx, err error) error {
	if errors.Is(err, impl.ErrInvalidPushSubscription) {
		return notificationBadRequest(ctx)
	}
	return notificationFailure(ctx, err)
}
