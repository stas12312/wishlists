package controller

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"main/config"
	apperror "main/error"
	"main/middleware"
	"main/model"
	"main/service"
	"time"
)

func NewUserController(userService *service.UserService, config *config.Config) *UserController {
	return &UserController{*userService, config}
}

type UserController struct {
	service.UserService
	*config.Config
}

func (c *UserController) Route(router fiber.Router) {
	auth := router.Group("/auth")
	auth.Post("/login", c.Auth)
	auth.Post("/register", c.Register)
	auth.Post("/refresh", c.RefreshToken)
	auth.Post("/confirm", c.Confirm)
	auth.Post("/restore", c.Restore)
	auth.Post("/reset-password", c.Reset)
	auth.Post("/check-code", c.CheckCode)
	auth.Post("/oauth/", middleware.Protected(false), c.OAuth)
	auth.Get("/oauth/providers", c.ListOAuthProviders)
	user := router.Group("/user")
	user.Use(middleware.Protected(true))
	user.Get("/me", c.Me)
}

func (c *UserController) Me(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	user, _ := c.UserService.GetById(ctx.UserContext(), userId)

	return ctx.JSON(user)

}

func (c *UserController) Register(ctx *fiber.Ctx) error {
	type RegisterModel struct {
		Email    string `json:"email" validate:"required"`
		Password string `json:"password" validate:"required,min=8,max=50,password-symbols"`
		Name     string `json:"name"`
	}

	register := new(RegisterModel)

	if err := ctx.BodyParser(register); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}

	if errs := NewValidator().Validate(register); len(errs) > 0 {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ValidateErrorResponse{Message: "Некорректно заполнены поля", Fields: errs})
	}

	_, confirmCode, err := c.UserService.Register(ctx.UserContext(), register.Email, register.Password, register.Name)
	if err != nil {
		return err
	}

	// Данные доступны для тестового окружения
	if c.Config.Environment != "test" {
		confirmCode.Code = ""
		confirmCode.Key = ""
	}

	return ctx.JSON(confirmCode)
}

func (c *UserController) Auth(ctx *fiber.Ctx) error {
	type AuthModel struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	auth := new(AuthModel)

	err := ctx.BodyParser(auth)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}

	user, err := c.Login(ctx.UserContext(), auth.Email, auth.Password)
	if err != nil {
		return err
	}
	tokenPair := makeTokenPair(user.Id, user.Email, &c.JWT)
	return ctx.JSON(tokenPair)
}

func (c *UserController) RefreshToken(ctx *fiber.Ctx) error {
	type RefreshRequest struct {
		RefreshToken string `json:"refresh_token"`
	}

	refreshRequest := new(RefreshRequest)

	if err := ctx.BodyParser(refreshRequest); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Не передан токен", Details: err.Error()})
	}

	tokenString := refreshRequest.RefreshToken

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(c.Config.JWT.RefreshSecretKey), nil
	})

	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорретный токен", Details: err.Error()})
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		id := int64(claims["id"].(float64))
		email := claims["email"].(string)
		newTokenPair := makeTokenPair(id, email, &c.Config.JWT)
		return ctx.JSON(newTokenPair)
	} else {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Ошибка формирования токена", Details: err.Error()})
	}

}

func (c *UserController) Confirm(ctx *fiber.Ctx) error {

	code := &model.Code{}

	if err := ctx.BodyParser(code); err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}

	user, err := c.UserService.Confirm(ctx.UserContext(), code)
	if err != nil {
		return err
	}

	tokenPair := makeTokenPair(user.Id, user.Email, &c.Config.JWT)
	return ctx.JSON(tokenPair)
}

func (c *UserController) Restore(ctx *fiber.Ctx) error {
	type restoreRequest struct {
		Email string `json:"email"`
	}

	request := &restoreRequest{}

	if err := ctx.BodyParser(request); err != nil {
		return ctx.Status(fiber.StatusUnprocessableEntity).
			JSON(model.ErrorResponse{Message: "Некоректные данные"})
	}

	code, err := c.UserService.Restore(ctx.UserContext(), request.Email)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Ошибка", Details: err.Error()})
	}

	// Данные доступны для тестового окружения
	if c.Config.Environment != "test" {
		code.Code = ""
		code.Key = ""
	}

	return ctx.Status(fiber.StatusOK).JSON(code)
}

func (c *UserController) Reset(ctx *fiber.Ctx) error {

	type ResetPassword struct {
		Password string `json:"password" validate:"required,min=8,max=50,password-symbols"`
	}

	code := &model.Code{}
	password := &ResetPassword{}

	if err := ctx.BodyParser(code); err != nil {
		return ctx.Status(fiber.StatusUnprocessableEntity).
			JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}
	if err := ctx.BodyParser(password); err != nil {
		return ctx.Status(fiber.StatusUnprocessableEntity).
			JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}

	if errs := NewValidator().Validate(password); len(errs) > 0 {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ValidateErrorResponse{Message: "Некорректно заполнены поля", Fields: errs})
	}

	user, err := c.UserService.Reset(ctx.UserContext(), code, password.Password)
	if err != nil {
		return ctx.Status(fiber.StatusUnprocessableEntity).
			JSON(model.ErrorResponse{Message: "Недействительный код"})
	}

	newTokenPair := makeTokenPair(user.Id, user.Email, &c.Config.JWT)
	return ctx.JSON(newTokenPair)

}

func (c *UserController) CheckCode(ctx *fiber.Ctx) error {

	type ResponseResult struct {
		IsValid       bool `json:"is_valid"`
		AttemptsCount int  `json:"attempts_count"`
	}

	code := &model.Code{}
	if err := ctx.BodyParser(code); err != nil {
		return ctx.Status(fiber.StatusUnprocessableEntity).
			JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}

	resultCode, isCorrect := c.UserService.CheckCode(ctx.UserContext(), code, true)
	if resultCode.UUID == "" {
		return apperror.NewError(apperror.CodeIsNotFound, "Код устарел")
	}
	if !isCorrect {
		return apperror.NewError(
			apperror.WrongCode,
			fmt.Sprintf("Некорректный код. Осталось попыток: %d", resultCode.AttemptsCount),
		)
	}

	return ctx.JSON(model.Response{Data: true})

}

func (c *UserController) OAuth(ctx *fiber.Ctx) error {

	type OAuthRequest struct {
		Type  string `json:"type"`
		Token string `json:"token"`
	}

	request := &OAuthRequest{}

	if err := ctx.BodyParser(request); err != nil {
		return ctx.Status(fiber.StatusUnprocessableEntity).
			JSON(model.ErrorResponse{Message: "Некорректные данные", Details: err.Error()})
	}

	user, err := c.UserService.OAuthAuth(ctx.UserContext(), GetUserIdFromCtx(ctx), request.Type, request.Token)
	if err != nil {
		return err
	}

	tokenPair := makeTokenPair(user.Id, user.Email, &c.JWT)
	return ctx.JSON(tokenPair)

}

func (c *UserController) ListOAuthProviders(ctx *fiber.Ctx) error {

	providers := c.UserService.ListOAuthProviders(ctx.UserContext())

	return ctx.JSON(model.Response{Data: providers})
}

func makeTokenPair(id int64, email string, jwtConfig *config.JWTConfig) model.TokenPariResponse {
	accessToken := makeToken(id, email, jwtConfig.AccessSecretKey, jwtConfig.AccessExpireTime)
	refreshToken := makeToken(id, email, jwtConfig.RefreshSecretKey, jwtConfig.RefreshExpireTime)

	return model.TokenPariResponse{AccessToken: accessToken, RefreshToken: refreshToken}
}

func makeToken(id int64, email, key string, expireTime time.Duration) string {
	token := jwt.New(jwt.SigningMethodHS256)

	claims := token.Claims.(jwt.MapClaims)
	claims["id"] = id
	claims["email"] = email
	claims["exp"] = time.Now().Add(time.Minute * expireTime).Unix()

	t, _ := token.SignedString([]byte(key))
	return t
}

func GetUserIdFromCtx(ctx *fiber.Ctx) int64 {
	if val, ok := ctx.Locals("userId").(int64); ok {
		return val
	}
	return 0
}
