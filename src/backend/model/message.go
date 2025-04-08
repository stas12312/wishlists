package model

type WSMessage struct {
	Event   string      `json:"event"`
	Data    interface{} `json:"data"`
	Channel string      `json:"channel"`
}
