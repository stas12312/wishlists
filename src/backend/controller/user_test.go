package controller

import (
	"bytes"
	"errors"
	"github.com/gofiber/fiber/v2"
	"main/config"
	"main/model"
	"main/service/mocks"
	"net/http/httptest"
	"testing"
)

func TestUserController_Auth(t *testing.T) {
	tests := []struct {
		name          string
		mocksBehavior func(mock *mocks.UserService)
		wantErr       bool
		body          []byte
		responseCode  int
	}{
		{
			name: "OK",
			mocksBehavior: func(mock *mocks.UserService) {
				mock.
					On("Login", "user@email.ru", "password").
					Once().
					Return(&model.User{Id: 1, Email: "user@email.ru"}, nil)
			},
			body:         []byte(`{"email": "user@email.ru", "password": "password"}`),
			responseCode: 200,
		},
		{
			name: "User isn't exists",
			mocksBehavior: func(mock *mocks.UserService) {
				mock.
					On("Login", "user@email.ru", "password").
					Once().
					Return(&model.User{}, errors.New("errors"))
			},
			body:         []byte(`{"email": "user@email.ru", "password": "password"}`),
			responseCode: 404,
		},
		{
			name:          "Wrong request",
			mocksBehavior: func(mock *mocks.UserService) {},
			body:          []byte(`{"email": "user@email.ru"`),
			responseCode:  400,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			req := httptest.NewRequest("POST", "/auth/login", bytes.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")
			userService := mocks.NewUserService(t)
			tt.mocksBehavior(userService)

			app := fiber.New()

			c := &UserController{
				UserService: userService,
				Config:      &config.Config{},
			}

			c.Route(app)

			res, err := app.Test(req, 2000000)
			if tt.wantErr && err != nil {
				t.Errorf("error %s", err.Error())
				return
			}
			if res.StatusCode != tt.responseCode {
				t.Errorf("%d != %d", res.StatusCode, tt.responseCode)

			}
		})
	}
}
