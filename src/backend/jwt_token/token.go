package jwt_token

import (
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"log"
	"os"
)

func GetUserFromJWT(tokenString string) int64 {
	log.Println(tokenString)
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(os.Getenv("JWT_ACCESS_SECRET_KEY")), nil
	})
	userId := int64(0)
	if token == nil {
		return userId
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		log.Println(claims["id"])
		userId = int64(claims["id"].(float64))
	} else {
		fmt.Println(err)
	}
	return userId
}
