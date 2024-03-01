package middleware

import (
	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"main/model"
	"os"
)

func Protected(requiredAuth bool) fiber.Handler {
	return jwtware.New(jwtware.Config{
		SigningKey:     jwtware.SigningKey{Key: []byte(os.Getenv("JWT_ACCESS_SECRET_KEY"))},
		ErrorHandler:   errorHandler(requiredAuth),
		Claims:         jwt.MapClaims{},
		SuccessHandler: successHandler,
	})
}

func errorHandler(withError bool) func(c *fiber.Ctx, err error) error {
	if withError {
		return jwtError
	}
	return func(c *fiber.Ctx, err error) error {
		c.Locals("userId", 0)
		return c.Next()
	}
}

func jwtError(c *fiber.Ctx, err error) error {
	return c.Status(fiber.StatusBadRequest).
		JSON(model.ErrorResponse{Message: "Некорретный токен", Details: err.Error()})

}

func successHandler(c *fiber.Ctx) error {
	token := c.Locals("user").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	c.Locals("userId", int64(claims["id"].(float64)))
	return c.Next()
}
