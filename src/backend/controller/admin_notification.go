package controller

import (
	"errors"
	apperror "main/error"
	"main/model"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

func (c *AdminController) ListNotifications(ctx *fiber.Ctx) error {
	filter := model.AdminNotificationFilter{
		Search: strings.TrimPrefix(strings.TrimSpace(ctx.Query("search")), "@"),
		Kind:   ctx.Query("kind"), Channel: ctx.Query("channel"), Status: ctx.Query("status"),
	}
	if value := ctx.Query("recipient_id"); value != "" {
		recipientID, err := strconv.ParseInt(value, 10, 64)
		if err != nil || recipientID < 1 {
			return apperror.NewError(apperror.ValidateError, "Некорректный ID получателя")
		}
		filter.RecipientID = recipientID
	}
	if filter.Kind != "" && !c.notificationService.SupportsKind(filter.Kind) {
		return apperror.NewError(apperror.ValidateError, "Некорректный тип уведомления")
	}
	switch filter.Channel {
	case "", "site", model.NotificationEmail, model.NotificationTelegram:
	default:
		return apperror.NewError(apperror.ValidateError, "Некорректный канал уведомлений")
	}
	switch filter.Status {
	case "", "read", "unread", "pending", "sent", "failed", "skipped":
	default:
		return apperror.NewError(apperror.ValidateError, "Некорректный статус уведомления")
	}
	if value := ctx.Query("since"); value != "" {
		since, err := time.Parse(time.RFC3339Nano, value)
		if err != nil {
			return apperror.NewError(apperror.ValidateError, "Некорректная дата начала периода")
		}
		filter.Since = &since
	}
	if cursor := ctx.Query("before"); cursor != "" {
		date, id, _ := strings.Cut(cursor, "/")
		before, dateErr := time.Parse(time.RFC3339Nano, date)
		beforeID, idErr := strconv.ParseInt(id, 10, 64)
		if dateErr != nil || idErr != nil || beforeID < 1 {
			return apperror.NewError(apperror.ValidateError, "Некорректная навигация")
		}
		filter.Before, filter.BeforeID = &before, beforeID
	}

	const pageSize = 25
	items, err := c.notificationService.ListAdmin(filter, pageSize+1)
	if err != nil {
		return err
	}
	next := ""
	if len(items) > pageSize {
		items = items[:pageSize]
		last := items[pageSize-1]
		next = last.CreatedAt.UTC().Format(time.RFC3339Nano) + "/" + strconv.FormatInt(last.ID, 10)
	}
	return ctx.JSON(model.Response{Data: fiber.Map{"items": items, "next": next}})
}

func (c *AdminController) GetNotification(ctx *fiber.Ctx) error {
	id, err := adminNotificationID(ctx)
	if err != nil {
		return err
	}
	item, err := c.notificationService.GetAdmin(id)
	if err != nil {
		return adminNotificationError(ctx, err)
	}
	return ctx.JSON(model.Response{Data: item})
}

func (c *AdminController) GetNotificationQuestion(ctx *fiber.Ctx) error {
	id, err := adminNotificationID(ctx)
	if err != nil {
		return err
	}
	item, err := c.notificationService.GetAdmin(id)
	if err != nil {
		return adminNotificationError(ctx, err)
	}
	questionID, err := strconv.ParseInt(item.ResourceKey, 10, 64)
	if err != nil || questionID < 1 || (item.Kind != model.NotificationQuestionCreated && item.Kind != model.NotificationQuestionAnswered) {
		return adminNotificationError(ctx, apperror.NewError(apperror.NotFound, "Вопрос недоступен или был удалён"))
	}
	question, err := c.questionService.GetById(item.RecipientID, questionID)
	if err != nil {
		var appError *apperror.Error
		if errors.As(err, &appError) && appError.Code == apperror.NotFound {
			return adminNotificationError(ctx, err)
		}
		log.Errorf("Не удалось получить вопрос к уведомлению %d: %v", id, err)
		return apperror.NewError(apperror.DatabaseError, "Не удалось загрузить вопрос")
	}
	answer := ""
	if question.Answer != nil {
		answer = question.Answer.Content.String
	}
	return ctx.JSON(model.Response{Data: fiber.Map{"content": question.Content, "answer": answer}})
}

func adminNotificationID(ctx *fiber.Ctx) (int64, error) {
	id, err := strconv.ParseInt(ctx.Params("id"), 10, 64)
	if err != nil || id < 1 {
		return 0, apperror.NewError(apperror.ValidateError, "Некорректный ID уведомления")
	}
	return id, nil
}

func adminNotificationError(ctx *fiber.Ctx, err error) error {
	var appError *apperror.Error
	if errors.As(err, &appError) && appError.Code == apperror.NotFound {
		return ctx.Status(fiber.StatusNotFound).JSON(model.ErrorResponse{Message: appError.Message, Code: appError.Code})
	}
	return err
}
