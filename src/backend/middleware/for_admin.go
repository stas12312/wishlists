package middleware

import (
	"context"
	"main/model"
	"main/service"

	"github.com/gofiber/fiber/v2"
)

func ForAdmin(userService service.UserService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userId, ok := c.Locals("userId").(int64)
		if !ok {
			return forAdminError(c)
		}

		user, err := userService.GetById(context.Background(), userId)
		if err != nil || !user.IsAdmin {
			return forAdminError(c)
		}
		return c.Next()
	}
}

func forAdminError(c *fiber.Ctx) error {
	return c.Status(fiber.StatusMethodNotAllowed).
		JSON(model.ErrorResponse{Message: "Недостаточно прав для метода", Code: 0})
}
