package controller

import (
	"github.com/gofiber/fiber/v2"
	"main/middleware"
	"main/model"
	"main/service"
)

func NewImageController(imageService service.ImageService) *ImageController {
	return &ImageController{imageService}
}

type ImageController struct {
	service.ImageService
}

func (c *ImageController) UploadImageHandler(ctx *fiber.Ctx) error {
	fileHeader, err := ctx.FormFile("file")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Ошибка при загрузке файла", Details: err.Error()})
	}

	file, err := fileHeader.Open()
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).
			JSON(model.ErrorResponse{Message: "Ошибка при загрузке файла", Details: err.Error()})
	}

	fileUrl, err := c.Upload(fileHeader.Filename, file)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).
			JSON(model.ErrorResponse{Message: "Ошибка при загрузке файла", Details: err.Error()})
	}

	return ctx.JSON(map[string]string{"image_url": fileUrl})

}

func (c *ImageController) Route(router fiber.Router) {
	router.Post("/images/upload", middleware.Protected(), c.UploadImageHandler)
}
