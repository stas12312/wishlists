package error

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"main/model"
)

var AppErrorHandler = func(ctx *fiber.Ctx, err error) error {

	var appError *Error
	if errors.As(err, &appError) {
		return ctx.
			Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: appError.Message, Code: appError.Code})
	}
	return ctx.Status(fiber.StatusInternalServerError).
		JSON(model.ErrorResponse{Message: "Внутренняя ошибка сервера", Details: err.Error()})
}
