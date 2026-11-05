package impl

import (
	"context"
	"errors"
	"main/model"
	"main/repository/mocks"
	"main/telegram"
	"strings"
	"testing"
)

type telegramBotClientStub struct {
	chatID int64
	text   string
	url    string
	err    error
}

func (s *telegramBotClientStub) SendMiniApp(_ context.Context, chatID int64, text, url string) error {
	s.chatID = chatID
	s.text = text
	s.url = url
	return s.err
}

func (s *telegramBotClientStub) SetWebhook(context.Context, string, string) error {
	return nil
}

func TestTelegramBotStartSendsMiniApp(t *testing.T) {
	for _, command := range []string{"/start auth", "/start", "/start@my_wishlists_bot auth"} {
		t.Run(command, func(t *testing.T) {
			bot := new(telegramBotClientStub)
			s := NewTelegramBotService(bot, "https://mywishlists.example/", nil)
			err := s.HandleUpdate(context.Background(), telegram.Update{Message: &telegram.Message{
				Text: command,
				Chat: telegram.Chat{ID: 42, Type: "private"},
			}})
			if err != nil {
				t.Fatal(err)
			}
			if bot.chatID != 42 || bot.url != "https://mywishlists.example/miniapp/telegram" || bot.text == "" {
				t.Fatalf("unexpected message: %+v", bot)
			}
		})
	}
}

func TestTelegramBotIgnoresUnrelatedUpdates(t *testing.T) {
	for _, update := range []telegram.Update{
		{},
		{Message: &telegram.Message{Text: "/start auth", Chat: telegram.Chat{Type: "group"}}},
		{Message: &telegram.Message{Text: "/start other", Chat: telegram.Chat{Type: "private"}}},
		{Message: &telegram.Message{Text: "hello", Chat: telegram.Chat{Type: "private"}}},
	} {
		bot := new(telegramBotClientStub)
		s := NewTelegramBotService(bot, "https://mywishlists.example", nil)
		if err := s.HandleUpdate(context.Background(), update); err != nil || bot.chatID != 0 {
			t.Fatalf("update must be ignored: %+v, err=%v", update, err)
		}
	}
}

func TestTelegramBotSendError(t *testing.T) {
	bot := &telegramBotClientStub{err: errors.New("request failed")}
	s := NewTelegramBotService(bot, "https://mywishlists.example", nil)
	err := s.HandleUpdate(context.Background(), telegram.Update{Message: &telegram.Message{
		Text: "/start auth",
		Chat: telegram.Chat{ID: 42, Type: "private"},
	}})
	if err == nil {
		t.Fatal("expected an error")
	}
}

func TestTelegramBotLinkSendsCodeToMiniApp(t *testing.T) {
	code := &model.Code{UUID: "b6341c65-0a48-483c-a733-548b45972f08", Key: strings.Repeat("a", 22), UserId: 42, CodeType: model.TelegramLinkCode}
	codes := mocks.NewCodeRepository(t)
	codes.On("Get", code.UUID).Return(code, nil).Once()
	payload := "link_" + code.UUID + "_" + code.Key
	bot := new(telegramBotClientStub)
	s := NewTelegramBotService(bot, "https://mywishlists.example", codes)
	err := s.HandleUpdate(context.Background(), telegram.Update{Message: &telegram.Message{
		Text: "/start " + payload,
		Chat: telegram.Chat{ID: 42, Type: "private"},
	}})
	if err != nil || bot.url != "https://mywishlists.example/miniapp/telegram?link_code="+payload+"&user_id=42" {
		t.Fatalf("unexpected url=%q err=%v", bot.url, err)
	}
}
