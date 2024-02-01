package middleware

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"time"
)

func NewTimer() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		if err := c.Next(); err != nil {
			return err
		}
		stop := time.Now()
		c.Append("Server-timing", fmt.Sprintf("app;dur=%v", stop.Sub(start).String()))
		return nil
	}
}
