package controller

import (
	"github.com/gofiber/fiber/v2"
	"main/middleware"
	"main/model"
	"main/service"
	"strconv"
)

type RequestUser struct {
	UserId int64 `json:"user_id"`
}

func NewFriendController(service service.FriendService) *FriendController {
	return &FriendController{service}
}

type FriendController struct {
	service.FriendService
}

func (c *FriendController) AddFriend(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	requestUser := &RequestUser{}

	if err := ctx.BodyParser(requestUser); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректные данные"})
	}

	if err := c.FriendService.AddFriend(userId, requestUser.UserId); err != nil {
		return err
	}

	return ctx.JSON(model.ErrorResponse{Message: "Ok"})

}
func (c *FriendController) ApplyRequest(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	requestUser := &RequestUser{}
	if err := ctx.BodyParser(requestUser); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректные данные"})
	}
	if err := c.FriendService.ApplyRequest(userId, requestUser.UserId); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).
			JSON(model.ErrorResponse{Message: err.Error()})
	}
	return ctx.JSON(model.ErrorResponse{Message: "Заявка принята"})
}

func (c *FriendController) DeclineRequest(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	requestUser := &RequestUser{}
	if err := ctx.BodyParser(requestUser); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректные данные"})
	}
	if err := c.FriendService.DeclineRequest(userId, requestUser.UserId); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).
			JSON(model.ErrorResponse{Message: err.Error()})
	}
	return ctx.JSON(model.ErrorResponse{Message: "Заявка принята"})
}

func (c *FriendController) GetFriends(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	friends, err := c.FriendService.ListOfFriends(userId)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse{Message: err.Error()})
	}
	return ctx.JSON(model.Response{Data: friends})
}

func (c *FriendController) GetFriendRequests(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	requests, err := c.FriendRequestList(userId)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse{Message: err.Error()})
	}
	return ctx.JSON(model.Response{Data: requests})
}

func (c *FriendController) IsFriends(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	requestUser := &RequestUser{}
	if err := ctx.BodyParser(requestUser); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректные данные"})
	}
	isFriends := c.FriendService.IsFriends(userId, requestUser.UserId)
	return ctx.JSON(model.Response{Data: isFriends})
}

func (c *FriendController) DeleteFriend(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	requestUser := &RequestUser{}
	if err := ctx.BodyParser(requestUser); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректные данные"})
	}
	if err := c.FriendService.RemoveFriend(userId, requestUser.UserId); err != nil {
		return err
	}
	return ctx.JSON(model.ErrorResponse{Message: "Пользователь удален из друзей"})
}

func (c *FriendController) GetFriendStatus(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	friendUserId, _ := strconv.ParseInt(ctx.Params("user_id"), 10, 64)

	status := c.FriendService.GetFriendStatus(userId, friendUserId)
	return ctx.JSON(model.Response{Data: status})
}

func (c *FriendController) GetCounters(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	counters, err := c.FriendService.GetCounters(userId)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse{Message: err.Error()})
	}
	return ctx.JSON(counters)
}

func (c *FriendController) DeleteFriendRequest(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	requestUser := &RequestUser{}
	if err := ctx.BodyParser(requestUser); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректные данные"})
	}
	if err := c.FriendService.DeleteRequest(userId, requestUser.UserId); err != nil {
		return err
	}
	return ctx.JSON(model.ResponseWithMessage{Message: "Запрос удален"})
}

func (c *FriendController) Route(router fiber.Router) {
	group := router.Group("/friends", middleware.Protected(true))

	group.Post("/add", c.AddFriend)
	group.Get("/:user_id/status", c.GetFriendStatus)
	group.Post("/apply_request", c.ApplyRequest)
	group.Post("/decline_request", c.DeclineRequest)
	group.Get("/", c.GetFriends)
	group.Get("/requests", c.GetFriendRequests)
	group.Post("/requests/delete", c.DeleteFriendRequest)
	group.Post("/is_friends", c.IsFriends)
	group.Post("/delete", c.DeleteFriend)
	group.Get("/counters", c.GetCounters)
}
