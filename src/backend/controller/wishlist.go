package controller

import (
	"fmt"
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

func (c *WishlistController) ListWishlists(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)

	filter := &model.WishlistFilter{}
	if err := ctx.QueryParser(filter); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректные фильтры", Details: err.Error()})
	}
	navigation := &model.Navigation{}

	if err := ctx.QueryParser(navigation); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректная навигация", Details: err.Error()})
	}

	if navigation.Count > 100 {
		navigation.Count = 100
	}
	if navigation.Cursor == nil || len(navigation.Cursor) == 0 {
		navigation.Cursor = []string{"", ""}
	}

	wishlists, err := c.ListForUser(userId, *filter, *navigation)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).
			JSON(model.ErrorResponse{Message: "Ошибка при получении списка", Details: err.Error()})
	}
	lastWishlist := model.Wishlist{}
	if len(wishlists) > 0 {
		lastWishlist = wishlists[len(wishlists)-1]
	}
	return ctx.JSON(
		model.Response{Data: wishlists,
			Navigation: model.Navigation{Cursor: []string{lastWishlist.CreatedAt, lastWishlist.Uuid}}},
	)
}

func (c *WishlistController) GetWishlist(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	wishlistId := ctx.Params("uuid")
	wishlist, err := c.GetForUserByUUID(userId, wishlistId)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).
			JSON(model.ErrorResponse{
				Message: "Вишлист не найден или скрыт настройками приватности",
				Details: err.Error(),
			})
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
			JSON(model.ErrorResponse{
				Message: "Вишлист не найден или скрыт настройками приватности",
				Details: err.Error(),
			})
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

func (c *WishlistController) RestoreWishHandler(ctx *fiber.Ctx) error {
	wishUuid := ctx.Params("uuid")
	userId := GetUserIdFromCtx(ctx)

	if err := c.WishlistService.RestoreWish(userId, wishUuid); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Не удалось восстановить запись", Details: err.Error()})
	}
	return ctx.JSON(model.ResponseWithMessage{Message: "Запись восстановлена"})
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

func (c *WishlistController) RestoreWishlistHandler(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	wishlistUUID := ctx.Params("uuid")

	if err := c.WishlistService.RestoreWishlist(userId, wishlistUUID); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Ошибка при восстановлении", Details: err.Error()})
	}

	return ctx.JSON(model.ResponseWithMessage{Message: "Запись восстановлена"})
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

func (c *WishlistController) ReserveWishHandler(ctx *fiber.Ctx) error {
	wishUuid := ctx.Params("uuid")
	userId := GetUserIdFromCtx(ctx)

	if err := c.WishlistService.ReserveWish(userId, wishUuid); err != nil {
		return err
	}

	return ctx.JSON(model.ResponseWithMessage{Message: "Желание забранировано"})
}

func (c *WishlistController) CancelReserveWishHandler(ctx *fiber.Ctx) error {
	wishUuid := ctx.Params("uuid")
	userId := GetUserIdFromCtx(ctx)

	if err := c.WishlistService.CancelWishReservation(userId, wishUuid); err != nil {
		return err
	}

	return ctx.JSON(model.ResponseWithMessage{Message: "Бронь отменена"})
}

func (c *WishlistController) ReservedWishes(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	wishes, err := c.ReservedList(userId)
	if err != nil {
		return ctx.JSON(model.ErrorResponse{Message: "Не удалось получить список", Details: err.Error()})
	}

	return ctx.JSON(model.Response{Data: wishes})
}

func (c *WishlistController) MakeWishFullHandler(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	wishUuid := ctx.Params("uuid")
	if err := c.WishlistService.MakeWishFull(userId, wishUuid); err != nil {
		return err
	}
	return ctx.JSON(model.ResponseWithMessage{Message: "Желание отмечено исполненным"})

}

func (c *WishlistController) MakeCancelFullHandler(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	wishUuid := ctx.Params("uuid")
	if err := c.WishlistService.CancelWishFull(userId, wishUuid); err != nil {
		return err
	}
	return ctx.JSON(model.ResponseWithMessage{Message: "Желание отмечено неисполненным"})

}

func (c *WishlistController) MoveWishHandler(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	wishUuid := ctx.Params("uuid")
	wishlist := &model.Wishlist{}
	if err := ctx.BodyParser(wishlist); err != nil {
		return ctx.JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}
	wish, err := c.MoveWish(userId, wishUuid, wishlist.Uuid)
	if err != nil {
		return err
	}
	return ctx.JSON(model.Response{Data: wish})
}

func (c *WishlistController) ParseShopUrl(ctx *fiber.Ctx) error {
	agent := fiber.Post(fmt.Sprintf("%s/parse", c.Config.ParseServiceUrl))
	agent.ContentType("application/json")
	agent.Body(ctx.Body())
	statusCode, body, errs := agent.Bytes()

	if len(errs) > 0 {
		return ctx.Status(fiber.StatusInternalServerError).
			JSON(model.ErrorResponse{Message: "Сервис времменно недоступен"})
	}
	ctx.Set("Content-Type", "application/json")
	return ctx.Status(statusCode).Send(body)

}

func (c *WishlistController) GetParseStatus(ctx *fiber.Ctx) error {

	taskId := ctx.Params("task_id")

	agent := fiber.Get(fmt.Sprintf("%s/parse/%s/status", c.Config.ParseServiceUrl, taskId))
	agent.ContentType("application/json")
	agent.Body(ctx.Body())
	statusCode, body, errs := agent.Bytes()

	if len(errs) > 0 {
		return ctx.Status(fiber.StatusInternalServerError).
			JSON(model.ErrorResponse{Message: "Сервис времменно недоступен"})
	}
	ctx.Set("Content-Type", "application/json")
	return ctx.Status(statusCode).Send(body)
}

func (c *WishlistController) Route(router fiber.Router) {

	wishlistGroup := router.Group("/wishlists")

	wishlistGroup.Post("/", middleware.Protected(true), c.Create)
	wishlistGroup.Get("/", middleware.Protected(false), c.ListWishlists)
	wishlistGroup.Get("/:uuid", middleware.Protected(false), c.GetWishlist)
	wishlistGroup.Post("/:uuid", middleware.Protected(true), c.Update)
	wishlistGroup.Get("/:uuid/wishes", middleware.Protected(false), c.ListWishesForWishlistHandler)
	wishlistGroup.Delete("/:uuid", middleware.Protected(true), c.DeleteWishlist)
	wishlistGroup.Post("/:uuid/restore", middleware.Protected(true), c.RestoreWishlistHandler)

	wishGroup := router.Group("/wishes")
	wishGroup.Post("/", middleware.Protected(true), c.CreateWishHandler)
	wishGroup.Get("/reserved", middleware.Protected(true), c.ReservedWishes)
	wishGroup.Delete("/:uuid", middleware.Protected(true), c.DeleteWishHandler)
	wishGroup.Post("/:uuid", middleware.Protected(true), c.UpdateWishHandler)
	wishGroup.Get("/:uuid", middleware.Protected(false), c.GetWish)

	wishGroup.Post("/:uuid/restore", middleware.Protected(true), c.RestoreWishHandler)
	wishGroup.Post("/:uuid/reserve", middleware.Protected(true), c.ReserveWishHandler)
	wishGroup.Post("/:uuid/cancel_reserve", middleware.Protected(true), c.CancelReserveWishHandler)

	wishGroup.Post("/:uuid/make_full", middleware.Protected(true), c.MakeWishFullHandler)
	wishGroup.Post("/:uuid/cancel_full", middleware.Protected(true), c.MakeCancelFullHandler)
	wishGroup.Post("/:uuid/move", middleware.Protected(true), c.MoveWishHandler)

	parseGroup := router.Group("/parse")
	parseGroup.Post("/", middleware.Protected(true), c.ParseShopUrl)
	parseGroup.Get("/:task_id/status", middleware.Protected(true), c.GetParseStatus)
}
