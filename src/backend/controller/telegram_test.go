package controller

import (
	"context"
	"encoding/json"
	"main/config"
	apperror "main/error"
	"main/model"
	"main/service"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
)

type telegramControllerTestService struct {
	service.TelegramService
	user   *model.User
	called bool
}

func (s *telegramControllerTestService) Authenticate(_ context.Context, raw string) (*model.User, error) {
	s.called = true
	return s.user, nil
}

func TestTelegramControllerAuthenticate(t *testing.T) {
	for _, linked := range []bool{false, true} {
		stub := &telegramControllerTestService{}
		if linked {
			stub.user = &model.User{Id: 42, Email: "test@example.org"}
		}
		app := fiber.New(fiber.Config{ErrorHandler: apperror.AppErrorHandler})
		cfg := &config.Config{JWT: config.JWTConfig{AccessSecretKey: "access", RefreshSecretKey: "refresh", AccessExpireTime: 15, RefreshExpireTime: 60}}
		NewTelegramController(stub, cfg).Route(app.Group("/api"))
		request := httptest.NewRequest("POST", "/api/auth/telegram/", strings.NewReader(`{"init_data":"verified-by-service"}`))
		request.Header.Set("Content-Type", "application/json")
		response, err := app.Test(request)
		if err != nil {
			t.Fatal(err)
		}
		var body struct {
			Linked bool `json:"linked"`
			model.TokenPariResponse
		}
		err = json.NewDecoder(response.Body).Decode(&body)
		response.Body.Close()
		if err != nil || response.StatusCode != 200 || body.Linked != linked || !stub.called {
			t.Fatalf("unexpected response: body=%+v err=%v", body, err)
		}
		if (body.AccessToken != "" && body.RefreshToken != "") != linked || (len(response.Cookies()) > 0) != linked {
			t.Fatal("tokens and cookies must only be issued for a linked account")
		}
	}
}

func TestTelegramControllerInspectDoesNotCreateSession(t *testing.T) {
	stub := &telegramControllerTestService{user: &model.User{Id: 42, Email: "test@example.org"}}
	app := fiber.New(fiber.Config{ErrorHandler: apperror.AppErrorHandler})
	NewTelegramController(stub, &config.Config{}).Route(app.Group("/api"))
	request := httptest.NewRequest("POST", "/api/auth/telegram/inspect", strings.NewReader(`{"init_data":"verified-by-service"}`))
	request.Header.Set("Content-Type", "application/json")
	response, err := app.Test(request)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	var body struct {
		Linked bool        `json:"linked"`
		User   *model.User `json:"user"`
	}
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if response.StatusCode != 200 || !body.Linked || body.User == nil || body.User.Id != 42 || len(response.Cookies()) != 0 {
		t.Fatalf("unexpected response: status=%d body=%+v cookies=%v", response.StatusCode, body, response.Cookies())
	}
}

func TestTelegramLinkRequiresSession(t *testing.T) {
	app := fiber.New()
	NewTelegramController(&telegramControllerTestService{}, &config.Config{}).Route(app.Group("/api"))
	request := httptest.NewRequest("POST", "/api/auth/telegram/link", strings.NewReader(`{"init_data":"data"}`))
	request.Header.Set("Content-Type", "application/json")
	response, err := app.Test(request)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	if response.StatusCode == 200 {
		t.Fatal("link accepted without an authenticated session")
	}
}
