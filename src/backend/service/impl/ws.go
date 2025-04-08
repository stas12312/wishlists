package impl

import (
	"github.com/gofiber/contrib/websocket"
	"log"
	"main/model"
	"main/service"
)

func NewWsImpl() service.WS {
	return &WSImpl{
		make(map[int64]map[*websocket.Conn]bool),
	}
}

type WSImpl struct {
	Connections map[int64]map[*websocket.Conn]bool
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
}
