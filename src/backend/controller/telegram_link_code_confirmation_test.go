package controller

import (
	"context"
	"encoding/json"
	"main/config"
	"main/model"
	"main/service"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
)

type telegramLinkConfirmationTestService struct {
	service.TelegramService
	payload string
}

func (s *telegramLinkConfirmationTestService) RedeemLinkCode(_ context.Context, _, payload string) (*model.User, error) {
	s.payload = payload
	return &model.User{Id: 42, Email: "test@example.org", Name: "Иван Иванов"}, nil
}

func TestTelegramLinkCodeRedeemCreatesSession(t *testing.T) {
	stub := &telegramLinkConfirmationTestService{}
	cfg := &config.Config{JWT: config.JWTConfig{AccessSecretKey: "access", RefreshSecretKey: "refresh", AccessExpireTime: 15, RefreshExpireTime: 60}}
	app := fiber.New()
	NewTelegramController(stub, cfg).Route(app.Group("/api"))
	payload := "link_b6341c65-0a48-483c-a733-548b45972f08_" + strings.Repeat("a", 22)
	body := `{"init_data":"verified-by-service","code":"` + payload + `"}`

	request := httptest.NewRequest("POST", "/api/auth/telegram/link-code/redeem", strings.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	response, err := app.Test(request)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	var responseBody struct {
		Linked bool   `json:"linked"`
		Name   string `json:"name"`
		model.TokenPariResponse
	}
	if err := json.NewDecoder(response.Body).Decode(&responseBody); err != nil {
		t.Fatal(err)
	}
	if response.StatusCode != 200 || !responseBody.Linked || responseBody.AccessToken == "" || responseBody.RefreshToken == "" || response.Header.Get("Set-Cookie") == "" || stub.payload != payload {
		t.Fatalf("unexpected response: status=%d body=%+v", response.StatusCode, responseBody)
	}
}
