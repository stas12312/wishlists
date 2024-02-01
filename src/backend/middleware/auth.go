package middleware

import (
	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"main/model"
	"os"
)

func Protected() fiber.Handler {
	return jwtware.New(jwtware.Config{
		SigningKey:   jwtware.SigningKey{Key: []byte(os.Getenv("JWT_ACCESS_SECRET_KEY"))},
		ErrorHandler: jwtError,
		Claims:       jwt.MapClaims{},
	})
}

func jwtError(c *fiber.Ctx, err error) error {
	return c.Status(fiber.StatusBadRequest).
		JSON(model.ErrorResponse{Message: "Некорретный токен", Details: err.Error()})

}
