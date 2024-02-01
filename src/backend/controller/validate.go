package controller

import (
	"github.com/go-playground/validator/v10"
	"main/model"
)

type XValidator struct {
	validator *validator.Validate
}

func NewValidator() *XValidator {
	validate := validator.New()
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

			validationErrors = append(validationErrors, elem)
		}
	}

	return validationErrors
}
