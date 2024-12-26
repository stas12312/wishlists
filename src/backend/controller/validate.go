package controller

import (
	"fmt"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2/log"
	"main/model"
	"regexp"
)

var passwordRe = regexp.MustCompile(`^[0-9A-Za-z~!?@#$%^&*_\-+()\[\]{}></|]+$`)
var loginRe = regexp.MustCompile(`^[0-9A-Za-z.-_]`)

type XValidator struct {
	validator *validator.Validate
}

func NewValidator() *XValidator {
	validate := validator.New()
	if err := validate.RegisterValidation("password-symbols", PasswordAvailableSymbols); err != nil {
		log.Panic(err)
	}
	if err := validate.RegisterValidation("username-symbols", UsernameAvailableSymbols); err != nil {
		log.Panic(err)
	}
	return &XValidator{validate}
}

func (v *XValidator) Validate(data interface{}) []model.ErrorField {
	var validationErrors []model.ErrorField

	errs := v.validator.Struct(data)
	if errs != nil {
		for _, err := range errs.(validator.ValidationErrors) {

			var elem model.ErrorField
			elem.Name = err.Field()
			elem.Tag = err.Tag()
			elem.Message = msgForTag(err.Tag(), err.Param())

			validationErrors = append(validationErrors, elem)
		}
	}

	return validationErrors
}

func PasswordAvailableSymbols(fl validator.FieldLevel) bool {
	return passwordRe.MatchString(fl.Field().String())
}

func UsernameAvailableSymbols(fl validator.FieldLevel) bool {
	return loginRe.MatchString(fl.Field().String())
}

func msgForTag(tag string, param string) string {

	switch tag {
	case "password-symbols":
		return `Пароль может содержать символы латинского алфавита, цифры или символы ~!?@#$%^&*_-+()[]{}></\|`
	case "required":
		return "Поля является обязательным"
	case "min":
		return fmt.Sprintf("Минимальное длинна строки %s", param)
	case "oneof":
		return fmt.Sprintf("Допустимое значения: %s", param)
	case "username-symbols":
		return "Имя пользователя может содержать символы латинского алфавита, цифры или символы -_."
	default:
		return tag
	}
}
