package controller

import (
	"fmt"
	"main/model"

	"github.com/gofiber/fiber/v2"
)

func proxyToParseService(ctx *fiber.Ctx, parseServiceUrl string, path string) error {
	url := fmt.Sprintf("%s%s", parseServiceUrl, path)
	if query := ctx.Request().URI().QueryString(); len(query) > 0 {
		url = fmt.Sprintf("%s?%s", url, query)
	}

	agent := fiber.AcquireAgent()
	agent.Request().Header.SetMethod(ctx.Method())
	agent.Request().SetRequestURI(url)
	if body := ctx.Body(); len(body) > 0 {
		agent.ContentType("application/json")
		agent.Body(body)
	}
	if err := agent.Parse(); err != nil {
		fiber.ReleaseAgent(agent)
		return parseServiceUnavailable(ctx)
	}

	// Ответ запрашивается отдельно, чтобы сохранить его Content-Type (например, image/jpeg у скриншотов)
	response := fiber.AcquireResponse()
	defer fiber.ReleaseResponse(response)
	agent.SetResponse(response)

	// Bytes возвращает агент в пул
	statusCode, body, errs := agent.Bytes()
	if len(errs) > 0 {
		return parseServiceUnavailable(ctx)
	}
	contentType := string(response.Header.ContentType())
	if contentType == "" {
		contentType = fiber.MIMEApplicationJSON
	}
	ctx.Set("Content-Type", contentType)
	// Тело принадлежит ответу из пула, который освобождается при выходе, а Send не копирует данные
	return ctx.Status(statusCode).Send(append([]byte(nil), body...))
}

func parseServiceUnavailable(ctx *fiber.Ctx) error {
	return ctx.Status(fiber.StatusBadGateway).
		JSON(model.ErrorResponse{Message: "Сервис временно недоступен"})
}
