package impl

import (
	"github.com/gofiber/fiber/v2/log"
	"github.com/h2non/bimg"
)

func convertImage(image []byte) ([]byte, error) {
	log.Info("Конвертация изображения")
	converted, err := bimg.NewImage(image).Convert(bimg.WEBP)
	return converted, err
}
