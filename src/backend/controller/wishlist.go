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

	if errs := NewValidator().Validate(wishlist); len(errs) > 0 {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ValidateErrorResponse{Message: "Некорректно заполнены поля", Fields: errs})
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
	filter := model.WishlistFilter{IsActive: ctx.QueryBool("is_active", true)}

	wishlists, err := c.ListForUser(userId, filter)
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
	wishlistUuid := ctx.Params("uuid")

	wishlist := &model.Wishlist{
		Uuid:     wishlistUuid,
		IsActive: true,
	}

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

func (c *WishlistController) CreateWishHandler(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)

	wish := &model.Wish{}

	if err := ctx.BodyParser(wish); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}

	if errs := NewValidator().Validate(wish); len(errs) > 0 {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ValidateErrorResponse{Message: "Некорректно заполнены поля", Fields: errs})
	}

	createdWish, err := c.AddWish(userId, wish)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).
			JSON(model.ErrorResponse{Message: "", Details: err.Error()})
	}

	return ctx.JSON(model.Response{Data: createdWish})
}

func (c *WishlistController) ListWishesForWishlistHandler(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	wishlistUuid := ctx.Params("uuid")

	wishers, err := c.ListWishesForWishlist(userId, wishlistUuid)
	if err != nil {
		return err
	}

	return ctx.JSON(model.Response{Data: wishers})
}

func (c *WishlistController) DeleteWishHandler(ctx *fiber.Ctx) error {
	wishUuid := ctx.Params("uuid")
	userId := GetUserIdFromCtx(ctx)
	if err := c.DeleteWish(userId, wishUuid); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).
			JSON(model.ErrorResponse{Details: err.Error()})
	}

	return ctx.JSON(model.ResponseWithMessage{Message: "Запись удалена"})
}

func (c *WishlistController) UpdateWishHandler(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	wishUuid := ctx.Params("uuid")
	wish := &model.Wish{
		Uuid:     wishUuid,
		IsActive: true,
	}

	if err := ctx.BodyParser(wish); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}

	updatedWith, err := c.UpdateWish(userId, wish)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).
			JSON(model.ErrorResponse{Details: err.Error()})
	}

	return ctx.JSON(updatedWith)
}

func (c *WishlistController) DeleteWishlist(ctx *fiber.Ctx) error {
	wishlistUuid := ctx.Params("uuid")
	userId := GetUserIdFromCtx(ctx)

	if err := c.WishlistService.DeleteWishlist(userId, wishlistUuid); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Ошибка при удалении", Details: err.Error()})
	}

	return ctx.JSON(model.ResponseWithMessage{Message: "Запись удалена"})

}

func (c *WishlistController) GetWish(ctx *fiber.Ctx) error {
	wishUuid := ctx.Params("uuid")
	userId := GetUserIdFromCtx(ctx)

	wish, err := c.WishlistService.GetWish(userId, wishUuid)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Не удалось найти желание", Details: err.Error()})
	}

	return ctx.JSON(wish)

}

func (c *WishlistController) Route(router fiber.Router) {

	wishlistGroup := router.Group("/wishlists")

	wishlistGroup.Post("/", middleware.Protected(true), c.Create)
	wishlistGroup.Get("/", middleware.Protected(true), c.GetUserWishlists)
	wishlistGroup.Get("/:uuid", middleware.Protected(false), c.GetWishlist)
	wishlistGroup.Post("/:uuid", middleware.Protected(true), c.Update)
	wishlistGroup.Get("/:uuid/wishes", middleware.Protected(false), c.ListWishesForWishlistHandler)
	wishlistGroup.Delete("/:uuid", middleware.Protected(true), c.DeleteWishlist)

	wishGroup := router.Group("/wishes")
	wishGroup.Post("/", middleware.Protected(true), c.CreateWishHandler)
	wishGroup.Delete("/:uuid", middleware.Protected(true), c.DeleteWishHandler)
	wishGroup.Post("/:uuid", middleware.Protected(true), c.UpdateWishHandler)
	wishGroup.Get("/:uuid", middleware.Protected(false), c.GetWish)
}
