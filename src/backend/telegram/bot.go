package telegram

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
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

type Update struct {
	Message *Message `json:"message"`
}

type Message struct {
	Text string `json:"text"`
	Chat Chat   `json:"chat"`
}

type Chat struct {
	ID   int64  `json:"id"`
	Type string `json:"type"`
}

type webAppInfo struct {
	URL string `json:"url"`
}

type inlineKeyboardButton struct {
	Text   string     `json:"text"`
	WebApp webAppInfo `json:"web_app"`
}

type sendMessageRequest struct {
	ChatID      int64  `json:"chat_id"`
	Text        string `json:"text"`
	ReplyMarkup struct {
		InlineKeyboard [][]inlineKeyboardButton `json:"inline_keyboard"`
	} `json:"reply_markup"`
}

func (c *APIClient) SendMiniApp(ctx context.Context, chatID int64, text, url string) error {
	request := sendMessageRequest{ChatID: chatID, Text: text}
	request.ReplyMarkup.InlineKeyboard = [][]inlineKeyboardButton{{
		{Text: "Открыть ✨ MyWishlists", WebApp: webAppInfo{URL: url}},
	}}
	return c.do(ctx, "sendMessage", request)
}

func (c *APIClient) SetWebhook(ctx context.Context, url, secret string) error {
	return c.do(ctx, "setWebhook", struct {
		URL         string `json:"url"`
		SecretToken string `json:"secret_token"`
	}{URL: url, SecretToken: secret})
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
		OK bool `json:"ok"`
	}
	if response.StatusCode != http.StatusOK || json.NewDecoder(response.Body).Decode(&result) != nil || !result.OK {
		return errors.New("Telegram отклонил запрос")
	}
	return nil
}
