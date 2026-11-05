package controller

import (
	"context"
	"main/telegram"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
)

type telegramBotControllerTestService struct {
	update telegram.Update
	called bool
}

func (s *telegramBotControllerTestService) HandleUpdate(_ context.Context, update telegram.Update) error {
	s.update = update
	s.called = true
	return nil
}

func TestTelegramBotWebhook(t *testing.T) {
	stub := new(telegramBotControllerTestService)
	app := fiber.New()
	NewTelegramBotController(stub, "secret").Route(app.Group("/api"))
	request := httptest.NewRequest("POST", "/api/webhook/telegram/secret", strings.NewReader(`{"message":{"text":"/start auth","chat":{"id":42,"type":"private"}}}`))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("X-Telegram-Bot-Api-Secret-Token", "secret")
	response, err := app.Test(request)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	if response.StatusCode != 200 || !stub.called || stub.update.Message == nil || stub.update.Message.Chat.ID != 42 {
		t.Fatalf("unexpected response: status=%d update=%+v", response.StatusCode, stub.update)
	}
}

func TestTelegramBotWebhookRejectsInvalidSecret(t *testing.T) {
	for _, test := range []struct {
		name   string
		path   string
		header string
	}{
		{name: "header", path: "/api/webhook/telegram/secret", header: "wrong"},
		{name: "path", path: "/api/webhook/telegram/wrong", header: "secret"},
	} {
		t.Run(test.name, func(t *testing.T) {
			stub := new(telegramBotControllerTestService)
			app := fiber.New()
			NewTelegramBotController(stub, "secret").Route(app.Group("/api"))
			request := httptest.NewRequest("POST", test.path, strings.NewReader(`{}`))
			request.Header.Set("Content-Type", "application/json")
			request.Header.Set("X-Telegram-Bot-Api-Secret-Token", test.header)
			response, err := app.Test(request)
			if err != nil {
				t.Fatal(err)
			}
			defer response.Body.Close()
			if response.StatusCode != 403 || stub.called {
				t.Fatalf("unexpected response: status=%d called=%v", response.StatusCode, stub.called)
			}
		})
	}
}
