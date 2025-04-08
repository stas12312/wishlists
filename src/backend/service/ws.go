package service

import (
	"github.com/gofiber/contrib/websocket"
	"main/model"
)

const (
	ChangeIncomingFriendsRequests = "ChangeIncomingFriendsRequests"
)

type WS interface {
	AddConnection(userId int64, conn *websocket.Conn)
	SendMessage(userId int64, message model.WSMessage)
	DeleteConnection(userId int64, conn *websocket.Conn)
}
