package telegram

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
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
