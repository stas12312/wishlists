package impl

import (
	"github.com/gofiber/contrib/websocket"
	"log"
	"main/model"
	"main/service"
)

func NewWsImpl() service.WSService {
	return &WSImpl{
		make(map[int64]map[*websocket.Conn]bool),
		make(map[string]map[*websocket.Conn]bool),
	}
}

type WSImpl struct {
	Connections map[int64]map[*websocket.Conn]bool
	Channels    map[string]map[*websocket.Conn]bool
}

func (w *WSImpl) AddConnection(userId int64, conn *websocket.Conn) {
	_, ok := w.Connections[userId]
	if !ok {
		w.Connections[userId] = make(map[*websocket.Conn]bool)
	}
	w.Connections[userId][conn] = true
}

func (w *WSImpl) SendMessage(userId int64, message model.WSMessage) {

	for conn, _ := range w.Connections[userId] {
		err := conn.WriteJSON(message)
		if err != nil {
			log.Println("write:", err.Error())
		}
	}
}

func (w *WSImpl) DeleteConnection(userId int64, conn *websocket.Conn) {
	delete(w.Connections[userId], conn)
	if len(w.Connections[userId]) == 0 {
		delete(w.Connections, userId)
	}
}

func (w *WSImpl) AddToChannel(name string, conn *websocket.Conn) {
	_, ok := w.Channels[name]
	if !ok {
		w.Channels[name] = make(map[*websocket.Conn]bool)
	}
	w.Channels[name][conn] = true

}

func (w *WSImpl) RemoveFromChannel(name string, conn *websocket.Conn) {
	delete(w.Channels[name], conn)
	if len(w.Channels[name]) == 0 {
		delete(w.Channels, name)
	}
}

func (w *WSImpl) SendMessageToChannel(channelName string, msg model.WSMessage) {
	msg.Channel = channelName
	for conn, _ := range w.Channels[channelName] {
		err := conn.WriteJSON(msg)
		if err != nil {
			log.Println("Message to channel", channelName, err.Error())
		}

	}
}
