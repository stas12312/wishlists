package controller

import (
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"log"
	"main/jwt_token"
	"main/service"
)

func NewWebSocketController(service service.WS) *WebSocketController {
	return &WebSocketController{service}
}

type WebSocketController struct {
	service.WS
}

func (c *WebSocketController) Connect() fiber.Handler {

	return websocket.New(
		func(conn *websocket.Conn) {

			token := conn.Query("token")
			userId := jwt_token.GetUserFromJWT(token)

			defer func() {
				c.DeleteConnection(userId, conn)
				err := conn.Close()
				if err != nil {
					log.Println(err.Error())
				}
			}()

			var (
				mt  int
				msg []byte
				err error
			)

			c.AddConnection(userId, conn)
			for {
				if mt, msg, err = conn.ReadMessage(); err != nil {
					break
				}

				if err = conn.WriteMessage(mt, msg); err != nil {
					break
				}
			}
		},
	)
}

func (c *WebSocketController) Route(router fiber.Router) {
	log.Println("Настройка сокета")
	router.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	router.Get("/ws", c.Connect())
}
