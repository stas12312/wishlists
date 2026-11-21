package impl

import (
	"log"
	"main/model"
	"sync"
	"time"

	"github.com/gofiber/contrib/websocket"
)

type wsConnection struct {
	conn *websocket.Conn
	mu   sync.Mutex
}

func (c *wsConnection) write(send func() error) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.conn == nil {
		return nil
	}
	if err := c.conn.SetWriteDeadline(time.Now().Add(2 * time.Second)); err != nil {
		return err
	}
	return send()
}

type WSImpl struct {
	mu          sync.RWMutex
	connections map[*websocket.Conn]*wsConnection
	users       map[int64]map[*websocket.Conn]*wsConnection
	channels    map[string]map[*websocket.Conn]*wsConnection
}

func NewWsImpl() *WSImpl {
	return &WSImpl{
		connections: make(map[*websocket.Conn]*wsConnection),
		users:       make(map[int64]map[*websocket.Conn]*wsConnection),
		channels:    make(map[string]map[*websocket.Conn]*wsConnection),
	}
}

func (w *WSImpl) AddConnection(userId int64, conn *websocket.Conn) {
	w.mu.Lock()
	defer w.mu.Unlock()
	connection := &wsConnection{conn: conn}
	w.connections[conn] = connection
	if userId > 0 {
		if w.users[userId] == nil {
			w.users[userId] = make(map[*websocket.Conn]*wsConnection)
		}
		w.users[userId][conn] = connection
	}
}

func (w *WSImpl) DeleteConnection(userId int64, conn *websocket.Conn) {
	w.mu.Lock()
	connection := w.connections[conn]
	delete(w.connections, conn)
	delete(w.users[userId], conn)
	if len(w.users[userId]) == 0 {
		delete(w.users, userId)
	}
	for name, channel := range w.channels {
		delete(channel, conn)
		if len(channel) == 0 {
			delete(w.channels, name)
		}
	}
	w.mu.Unlock()
	if connection != nil {
		connection.mu.Lock()
		connection.conn = nil
		connection.mu.Unlock()
	}
}

func (w *WSImpl) AddToChannel(name string, conn *websocket.Conn) {
	w.mu.Lock()
	defer w.mu.Unlock()
	if connection := w.connections[conn]; connection != nil {
		if w.channels[name] == nil {
			w.channels[name] = make(map[*websocket.Conn]*wsConnection)
		}
		w.channels[name][conn] = connection
	}
}

func (w *WSImpl) RemoveFromChannel(name string, conn *websocket.Conn) {
	w.mu.Lock()
	defer w.mu.Unlock()
	delete(w.channels[name], conn)
	if len(w.channels[name]) == 0 {
		delete(w.channels, name)
	}
}

func (w *WSImpl) Reply(conn *websocket.Conn, messageType int, data []byte) error {
	w.mu.RLock()
	connection := w.connections[conn]
	w.mu.RUnlock()
	if connection == nil {
		return nil
	}
	return connection.write(func() error { return conn.WriteMessage(messageType, data) })
}

func (w *WSImpl) SendMessage(userId int64, message model.WSMessage) {
	w.mu.RLock()
	connections := copyConnections(w.users[userId])
	w.mu.RUnlock()
	sendWSMessage(connections, message)
}

func (w *WSImpl) SendMessageToChannel(channelName string, message model.WSMessage) {
	w.mu.RLock()
	connections := copyConnections(w.channels[channelName])
	w.mu.RUnlock()
	message.Channel = channelName
	sendWSMessage(connections, message)
}

func copyConnections(connections map[*websocket.Conn]*wsConnection) []*wsConnection {
	result := make([]*wsConnection, 0, len(connections))
	for _, connection := range connections {
		result = append(result, connection)
	}
	return result
}

func sendWSMessage(connections []*wsConnection, message model.WSMessage) {
	for _, connection := range connections {
		err := connection.write(func() error { return connection.conn.WriteJSON(message) })
		if err != nil {
			log.Println("Ошибка отправки через WebSocket:", err)
		}
	}
}
