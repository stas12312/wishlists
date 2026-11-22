package telegram

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"html"
	"log/slog"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

type BotClient interface {
	SendMiniApp(ctx context.Context, chatID int64, text, url string) error
	SetWebhook(ctx context.Context, url, secret string) error
}

type APIClient struct {
	token      string
	baseURL    string
	httpClient *http.Client
	recordSent func(context.Context, Message) error
}

func (c *APIClient) SetMessageRecorder(record func(context.Context, Message) error) {
	c.recordSent = record
}

func NewAPIClient(token string) *APIClient {
	return &APIClient{
		token:      token,
		baseURL:    "https://api.telegram.org",
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

func (c *APIClient) SetProxy(address string) error {
	proxyURL, err := url.Parse(address)
	if err != nil || proxyURL.Hostname() == "" || proxyURL.Opaque != "" {
		return errors.New("некорректный адрес TELEGRAM_PROXY_URL")
	}
	switch proxyURL.Scheme {
	case "http", "https", "socks5", "socks5h":
	default:
		return errors.New("TELEGRAM_PROXY_URL должен использовать http, https, socks5 или socks5h")
	}
	transport := http.DefaultTransport.(*http.Transport).Clone()
	transport.Proxy = http.ProxyURL(proxyURL)
	c.httpClient.Transport = transport
	return nil
}

func (c *APIClient) Transport() http.RoundTripper {
	return c.httpClient.Transport
}

type Update struct {
	ID                    int64    `json:"update_id"`
	Message               *Message `json:"message"`
	EditedMessage         *Message `json:"edited_message"`
	ChannelPost           *Message `json:"channel_post"`
	EditedChannelPost     *Message `json:"edited_channel_post"`
	BusinessMessage       *Message `json:"business_message"`
	EditedBusinessMessage *Message `json:"edited_business_message"`
}

type Message struct {
	ID       int64  `json:"message_id"`
	Date     int64  `json:"date"`
	EditDate int64  `json:"edit_date"`
	Text     string `json:"text"`
	Caption  string `json:"caption"`
	Chat     Chat   `json:"chat"`
	kind     string
}

type Chat struct {
	ID   int64  `json:"id"`
	Type string `json:"type"`
}

type webAppInfo struct {
	URL string `json:"url"`
}

type inlineKeyboardButton struct {
	Text   string      `json:"text"`
	WebApp *webAppInfo `json:"web_app,omitempty"`
	URL    string      `json:"url,omitempty"`
}

type sendMessageRequest struct {
	ChatID      int64  `json:"chat_id"`
	Text        string `json:"text"`
	ParseMode   string `json:"parse_mode,omitempty"`
	ReplyMarkup struct {
		InlineKeyboard [][]inlineKeyboardButton `json:"inline_keyboard"`
	} `json:"reply_markup"`
}

func (c *APIClient) SendMiniApp(ctx context.Context, chatID int64, text, url string) error {
	request := sendMessageRequest{ChatID: chatID, Text: text}
	request.ReplyMarkup.InlineKeyboard = [][]inlineKeyboardButton{{
		{Text: "Открыть ✨ MyWishlists", WebApp: &webAppInfo{URL: url}},
	}}
	return c.do(ctx, "sendMessage", request)
}

func (c *APIClient) SendNotification(ctx context.Context, chatID int64, title, entityTitle, body, miniAppURL, siteURL string) error {
	text := "<b>" + html.EscapeString(title) + "</b>"
	if entityTitle != "" {
		text += "\n\n<b>" + html.EscapeString(entityTitle) + "</b>"
	}
	if body != "" {
		text += "\n" + html.EscapeString(body)
	}
	request := sendMessageRequest{ChatID: chatID, Text: text, ParseMode: "HTML"}
	request.ReplyMarkup.InlineKeyboard = [][]inlineKeyboardButton{
		{{Text: "Открыть в приложении", WebApp: &webAppInfo{URL: miniAppURL}}},
		{{Text: "Открыть на сайте", URL: siteURL}},
	}
	return c.do(ctx, "sendMessage", request)
}

type APIError struct {
	Code       int
	RetryAfter time.Duration
}

func (e *APIError) Error() string {
	return "Telegram отклонил запрос (" + strconv.Itoa(e.Code) + ")"
}

func (c *APIClient) SetWebhook(ctx context.Context, url, secret string) error {
	return c.do(ctx, "setWebhook", struct {
		URL            string   `json:"url"`
		SecretToken    string   `json:"secret_token"`
		AllowedUpdates []string `json:"allowed_updates"`
	}{
		URL: url, SecretToken: secret,
		AllowedUpdates: []string{"message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message"},
	})
}

func (c *APIClient) do(ctx context.Context, method string, payload any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/bot"+c.token+"/"+method, bytes.NewReader(body))
	if err != nil {
		return errors.New("не удалось подготовить запрос к Telegram")
	}
	req.Header.Set("Content-Type", "application/json")
	response, err := c.httpClient.Do(req)
	if err != nil {
		return errors.New("не удалось отправить запрос к Telegram")
	}
	defer response.Body.Close()
	var result struct {
		OK         bool            `json:"ok"`
		ErrorCode  int             `json:"error_code"`
		Result     json.RawMessage `json:"result"`
		Parameters struct {
			RetryAfter int `json:"retry_after"`
		} `json:"parameters"`
	}
	if err := json.NewDecoder(response.Body).Decode(&result); response.StatusCode != http.StatusOK || err != nil || !result.OK {
		code := result.ErrorCode
		if code == 0 {
			code = response.StatusCode
		}
		return &APIError{Code: code, RetryAfter: time.Duration(result.Parameters.RetryAfter) * time.Second}
	}
	if method == "sendMessage" && c.recordSent != nil {
		var message Message
		if err := json.Unmarshal(result.Result, &message); err != nil || message.Chat.ID == 0 {
			slog.Error("В ответе Telegram отсутствует отправленное сообщение")
			return nil
		}
		recordCtx, cancel := context.WithTimeout(context.WithoutCancel(ctx), 5*time.Second)
		defer cancel()
		if err := c.recordSent(recordCtx, message); err != nil {
			slog.Error("Не удалось записать отправленное сообщение Telegram", "chat_id", message.Chat.ID, "message_id", message.ID)
		}
	}
	return nil
}
