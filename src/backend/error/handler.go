package error

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"main/model"
)

var AppErrorHandler = func(ctx *fiber.Ctx, err error) error {

	log.Error(err.Error())

	var appError *Error
	if errors.As(err, &appError) {
		status := fiber.StatusBadRequest
		if appError.Code == ReservationCheckCooldown {
			status = fiber.StatusTooManyRequests
		}

		return ctx.
			Status(status).
			JSON(model.ErrorResponse{Message: appError.Message, Code: appError.Code, Details: appError.Details})
	}
	return ctx.Status(fiber.StatusInternalServerError).
		JSON(model.ErrorResponse{Message: "Внутренняя ошибка сервера", Details: err.Error()})
}
