package controller

import (
	"log"
	"main/middleware"
	"main/model"
	"main/service"

	"github.com/gofiber/fiber/v2"
)

func NewImageController(imageService service.ImageService) *ImageController {
	return &ImageController{imageService}
}

type ImageController struct {
	service.ImageService
}

func (c *ImageController) UploadImageHandler(ctx *fiber.Ctx) error {
	fileHeader, err := ctx.FormFile("file")
	log.Print("Загрузка по файлу")
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

func (c *ImageController) UploadImageByURLHandler(ctx *fiber.Ctx) error {

	type ImageInfo struct {
		Url string `json:"url"`
	}

	image := &ImageInfo{}
	if err := ctx.BodyParser(image); err != nil {
		return ctx.Status(fiber.StatusUnprocessableEntity).JSON(model.ErrorResponse{Message: "Некорректные данные"})
	}

	fileUrl, err := c.UploadByURL(image.Url)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).
			JSON(model.ErrorResponse{Message: "Ошибка при загрузке файла", Details: err.Error()})
	}

	return ctx.JSON(map[string]string{"image_url": fileUrl})

}

func (c *ImageController) Route(router fiber.Router) {
	router.Post("/images/upload", middleware.Protected(true), c.UploadImageHandler)
	router.Post("/images/upload-by-url", middleware.Protected(true), c.UploadImageByURLHandler)
}
