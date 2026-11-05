package controller

import (
	"context"
	"encoding/json"
	"main/config"
	"main/service"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
)

type telegramLinkCodeTestService struct {
	service.TelegramService
	userID int64
}

func (s *telegramLinkCodeTestService) CreateLinkCode(_ context.Context, userID int64) (string, error) {
	s.userID = userID
	return "https://t.me/test_bot?startapp=link_uuid_key", nil
}

func TestTelegramCreateLinkCode(t *testing.T) {
	stub := &telegramLinkCodeTestService{}
	controller := NewTelegramController(stub, &config.Config{})
	app := fiber.New()
	app.Post("/link-code", func(ctx *fiber.Ctx) error {
		ctx.Locals("userId", int64(42))
		return controller.CreateLinkCode(ctx)
	})
	request := httptest.NewRequest("POST", "/link-code", nil)
	response, err := app.Test(request)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	var body struct {
		URL       string `json:"url"`
		ExpiresIn int    `json:"expires_in"`
	}
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if response.StatusCode != 200 || stub.userID != 42 || body.URL == "" || body.ExpiresIn != 300 {
		t.Fatalf("unexpected response: status=%d userID=%d body=%+v", response.StatusCode, stub.userID, body)
	}
}

func TestTelegramLinkCodeRequiresSession(t *testing.T) {
	app := fiber.New()
	NewTelegramController(&telegramLinkCodeTestService{}, &config.Config{}).Route(app.Group("/api"))
	request := httptest.NewRequest("POST", "/api/auth/telegram/link-code", nil)
	response, err := app.Test(request)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	if response.StatusCode == 200 {
		t.Fatal("link code created without an authenticated session")
	}
}
