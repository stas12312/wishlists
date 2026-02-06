package controller

import (
	"context"
	"main/middleware"
	"main/model"
	"main/service"

	"github.com/gofiber/fiber/v2"
)

func NewAdminController(userService service.UserService) *AdminController {
	return &AdminController{userService: userService}
}

type AdminController struct {
	userService service.UserService
}

func (c *AdminController) IsAdmin(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	user, err := c.userService.GetById(context.Background(), userId)
	if err != nil {
		return err
	}
	return ctx.JSON(model.Response{Data: fiber.Map{"IsAdmin": user.IsAdmin}})
}

func (c *AdminController) Route(router fiber.Router) {

	group := router.Group("/admin", middleware.Protected(true))

	group.Get("/is", c.IsAdmin)

}
