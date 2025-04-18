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
	"strings"
	"time"
)

func NewUserController(userService *service.UserService, config *config.Config) *UserController {
	return &UserController{*userService, config}
}

type UserController struct {
	service.UserService
	*config.Config
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

	register.Email = strings.TrimSpace(register.Email)
	register.Name = strings.TrimSpace(register.Name)

	_, confirmCode, err := c.UserService.Register(ctx.UserContext(), register.Email, register.Password, register.Name)
	if err != nil {
		return err
	}

	// Данные доступны для тестового окружения
	if !c.Config.IsTest() || ctx.Get("Return-Code") != "true" {
		return ctx.JSON(model.ShortCode{UUID: confirmCode.UUID, SecretKey: confirmCode.SecretKey})
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

	auth.Email = strings.TrimSpace(auth.Email)

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
			JSON(model.ErrorResponse{Message: "Ошибка формирования токена", Details: ""})
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

	request.Email = strings.TrimSpace(request.Email)

	code, err := c.UserService.Restore(ctx.UserContext(), request.Email)
	if err != nil {
		return err
	}

	// Данные доступны для тестового окружения
	if !c.Config.IsTest() || ctx.Get("Return-Code") != "true" {
		return ctx.JSON(model.ShortCode{UUID: code.UUID, SecretKey: code.SecretKey})
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

func (c *UserController) ChangePassword(ctx *fiber.Ctx) error {

	type ChangePasswordRequest struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password" validate:"required,min=8,max=50,password-symbols"`
	}

	request := &ChangePasswordRequest{}

	if err := ctx.BodyParser(request); err != nil {
		return apperror.NewError(apperror.ValidateError, "Некоректные данные")
	}

	if errs := NewValidator().Validate(request); len(errs) > 0 {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ValidateErrorResponse{Message: "Некорректно заполнены поля", Fields: errs})
	}

	userId := GetUserIdFromCtx(ctx)
	err := c.UserService.ChangePassword(ctx.UserContext(), userId, request.OldPassword, request.NewPassword)
	if err != nil {
		return err
	}

	return ctx.JSON(model.Response{Data: "ok"})

}

func (c *UserController) GetByUsername(ctx *fiber.Ctx) error {

	username := ctx.Params("username")

	user, err := c.UserService.GetByUsername(ctx.UserContext(), username)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Не удалось получить пользователя", Details: err.Error()})
	}
	user.Email = ""

	return ctx.JSON(user)
}

func (c *UserController) UpdateProfile(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	user := &model.UserForUpdate{}

	if err := ctx.BodyParser(user); err != nil {
		return ctx.Status(fiber.StatusUnprocessableEntity).JSON(model.ErrorResponse{Message: "Некорректные данные"})
	}
	user.Id = userId

	if errs := NewValidator().Validate(user); len(errs) > 0 {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ValidateErrorResponse{Message: "Некорректно заполнены поля", Fields: errs})
	}

	user.Name = strings.TrimSpace(user.Name)

	updatedUser, err := c.UserService.Update(ctx.UserContext(), user)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Не удалось обновить пользователя", Details: err.Error()})
	}

	return ctx.JSON(updatedUser)
}

func (c *UserController) GetAuthInfo(ctx *fiber.Ctx) error {

	userId := GetUserIdFromCtx(ctx)
	user, err := c.GetById(ctx.Context(), userId)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Ошибка при получении пользователя", Details: err.Error()})
	}

	authInfo := &model.AuthInfo{
		HasPassword: user.Password != "",
	}

	return ctx.JSON(authInfo)
}

func (c *UserController) DeleteUser(ctx *fiber.Ctx) error {
	userId := GetUserIdFromCtx(ctx)
	err := c.Delete(ctx.Context(), userId)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Не удалось удалить пользователя", Details: err.Error()})
	}
	return ctx.JSON(model.Response{Data: true})
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
	user.Post("/", middleware.Protected(true), c.UpdateProfile)
	user.Delete("/", middleware.Protected(true), c.DeleteUser)
	user.Get("/me", middleware.Protected(true), c.Me)
	user.Post("/change-password", middleware.Protected(true), c.ChangePassword)
	user.Get("/auth-info", middleware.Protected(true), c.GetAuthInfo)
	user.Get("/:username", c.GetByUsername)
}
