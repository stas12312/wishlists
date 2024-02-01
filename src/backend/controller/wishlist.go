package controller

import (
	"github.com/gofiber/fiber/v2"
	"main/config"
	"main/middleware"
	"main/model"
	"main/service"
)

func NewWishlistController(service *service.WishlistService, config *config.Config) *WishlistController {
	return &WishlistController{*service, config}
}

type WishlistController struct {
	service.WishlistService
	*config.Config
}

func (c *WishlistController) Create(ctx *fiber.Ctx) error {

	wishlist := new(model.Wishlist)

	if err := ctx.BodyParser(wishlist); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}
	userId := GetUserIdFromCtx(ctx)
	wishlist.UserId = userId

	createdWishlist, err := c.WishlistService.Create(wishlist)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Ошибка при создании вишлиста", Details: err.Error()})
	}

	return ctx.JSON(model.Response{Data: createdWishlist})

}

func (c *WishlistController) GetUserWishlists(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)

	wishlists, err := c.ListForUser(userId)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).
			JSON(model.ErrorResponse{Message: "Ошибка при получении списка", Details: err.Error()})
	}

	return ctx.JSON(model.Response{Data: wishlists})
}

func (c *WishlistController) GetWishlist(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	wishlistId := ctx.Params("uuid")
	wishlist, err := c.GetForUserByUUID(userId, wishlistId)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).
			JSON(model.ErrorResponse{Message: "Запись не найдена", Details: err.Error()})
	}

	return ctx.JSON(model.Response{Data: wishlist})
}

func (c *WishlistController) Update(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)

	wishlist := &model.Wishlist{}

	if err := ctx.BodyParser(wishlist); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}

	updatedWishlist, err := c.UpdateForUser(userId, wishlist)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).
			JSON(model.ErrorResponse{Message: "Запись не найдена", Details: err.Error()})
	}

	return ctx.JSON(model.Response{Data: updatedWishlist})
}

func (c *WishlistController) Route(router fiber.Router) {

	group := router.Group("/wishlists")
	group.Use(middleware.Protected())

	group.Post("/", c.Create)
	group.Get("/", c.GetUserWishlists)
	group.Get("/:uuid", c.GetWishlist)
	group.Post("/:uuid", c.Update)
}
