package controller

import (
	"github.com/gofiber/fiber/v2"
	apperror "main/error"
	"main/model"
	"strconv"
)

func (c *AdminController) ListUsers(ctx *fiber.Ctx) error {
	before, err := strconv.ParseInt(ctx.Query("before", "0"), 10, 64)
	if err != nil || before < 0 {
		return apperror.NewError(apperror.ValidateError, "Некорректная навигация")
	}
	users, err := c.adminUserService.List(ctx.Query("search"), before, 50)
	if err != nil {
		return err
	}
	return ctx.JSON(model.Response{Data: users})
}

func adminUserID(ctx *fiber.Ctx) (int64, error) {
	id, err := strconv.ParseInt(ctx.Params("id"), 10, 64)
	if err != nil || id < 1 {
		return 0, apperror.NewError(apperror.ValidateError, "Некорректный ID пользователя")
	}
	return id, nil
}

func (c *AdminController) GetUser(ctx *fiber.Ctx) error {
	id, err := adminUserID(ctx)
	if err != nil {
		return err
	}
	user, err := c.adminUserService.Get(id)
	if err != nil {
		return err
	}
	return ctx.JSON(model.Response{Data: user})
}

func (c *AdminController) DeleteUserLink(ctx *fiber.Ctx) error {
	id, err := adminUserID(ctx)
	if err != nil {
		return err
	}
	if err := c.adminUserService.DeleteLink(id, ctx.Params("provider"), ctx.Query("external_id")); err != nil {
		return err
	}
	return ctx.JSON(model.Response{Data: "ok"})
}
