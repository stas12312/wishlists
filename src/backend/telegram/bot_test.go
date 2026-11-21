package telegram

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestAPIClientSendMiniApp(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/bottoken/sendMessage" {
			t.Errorf("unexpected path: %s", r.URL.Path)
		}
		var request sendMessageRequest
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			t.Error(err)
		}
		if request.ChatID != 42 || len(request.ReplyMarkup.InlineKeyboard) != 1 {
			t.Errorf("unexpected request: %+v", request)
		} else {
			button := request.ReplyMarkup.InlineKeyboard[0][0]
			if button.WebApp.URL != "https://mywishlists.example/miniapp/telegram" {
				t.Errorf("unexpected button: %+v", button)
			}
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"ok":true}`))
	}))
	defer server.Close()
	client := NewAPIClient("token")
	client.baseURL = server.URL
	if err := client.SendMiniApp(context.Background(), 42, "Login", "https://mywishlists.example/miniapp/telegram"); err != nil {
		t.Fatal(err)
	}
}

func TestAPIClientSendNotification(t *testing.T) {
	const miniAppURL = "https://mywishlists.example/miniapp/telegram?ret=%2Ftickets%2F1"
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var request sendMessageRequest
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			t.Error(err)
		}
		if r.URL.Path != "/bottoken/sendMessage" || request.ChatID != 42 || request.Text != "Ответ поддержки" {
			t.Errorf("unexpected request: %s %+v", r.URL.Path, request)
		}
		keyboard := request.ReplyMarkup.InlineKeyboard
		if len(keyboard) != 1 || len(keyboard[0]) != 1 || keyboard[0][0].WebApp == nil || keyboard[0][0].WebApp.URL != miniAppURL {
			t.Errorf("unexpected keyboard: %+v", keyboard)
		}
		w.WriteHeader(http.StatusTooManyRequests)
		_, _ = w.Write([]byte(`{"ok":false,"error_code":429,"parameters":{"retry_after":120}}`))
	}))
	defer server.Close()
	client := NewAPIClient("token")
	client.baseURL = server.URL
	err := client.SendNotification(context.Background(), 42, "Ответ поддержки", miniAppURL)
	var apiError *APIError
	if !errors.As(err, &apiError) || apiError.Code != http.StatusTooManyRequests || apiError.RetryAfter != 2*time.Minute {
		t.Fatalf("unexpected error: %+v", err)
	}
}

func TestAPIClientSetWebhook(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var request struct {
			URL         string `json:"url"`
			SecretToken string `json:"secret_token"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			t.Error(err)
		}
		if request.URL != "https://mywishlists.example/api/webhook/telegram/bot-token" || request.SecretToken != "secret" {
			t.Errorf("unexpected request: %+v", request)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"ok":true}`))
	}))
	defer server.Close()
	client := NewAPIClient("token")
	client.baseURL = server.URL
	if err := client.SetWebhook(context.Background(), "https://mywishlists.example/api/webhook/telegram/bot-token", "secret"); err != nil {
		t.Fatal(err)
	}
}
