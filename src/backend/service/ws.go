package service

import (
	"github.com/gofiber/contrib/websocket"
	"main/model"
)

const (
	ChangeIncomingFriendsRequests = "ChangeIncomingFriendsRequests"

	Subscribe   = "Subscribe"
	Unsubscribe = "Unsubscribe"

	Update = "Update"
)

//go:generate mockery --name WSService

type WSService interface {
	AddConnection(userId int64, conn *websocket.Conn)
	SendMessage(userId int64, message model.WSMessage)
	DeleteConnection(userId int64, conn *websocket.Conn)
	AddToChannel(name string, conn *websocket.Conn)
	RemoveFromChannel(name string, conn *websocket.Conn)
	SendMessageToChannel(channelName string, msg model.WSMessage)
}
