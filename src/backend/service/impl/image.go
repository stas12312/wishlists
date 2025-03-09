package impl

import (
	"bytes"
	"fmt"
	"github.com/gofiber/fiber/v2/log"
	"github.com/h2non/bimg"
	"io"
	"main/config"
	"main/repository"
	"path/filepath"
)

type UUIDGenerator func() string

func NewImageService(
	repository repository.ImageRepository,
	generator UUIDGenerator,
	features config.Features,
) *ImageServiceImpl {

	return &ImageServiceImpl{repository, generator, features}
}

type ImageServiceImpl struct {
	repository.ImageRepository
	UUIDGenerator
	config.Features
}

func (s *ImageServiceImpl) Upload(filename string, file io.Reader) (string, error) {

	extension := filepath.Ext(filename)
	if s.Features.ConvertImageToWebp {
		extension = ".webp"
	}

	fullFilename := fmt.Sprintf("images/%s%s", s.UUIDGenerator(), extension)

	image := file
	if s.Features.ConvertImageToWebp {
		buffer, _ := io.ReadAll(file)
		imageBuffer, err := convertImage(buffer)
		if err != nil {
			return "", err
		}
		image = bytes.NewReader(imageBuffer)
	}

	return s.ImageRepository.Upload(fullFilename, image)
}

func convertImage(image []byte) ([]byte, error) {
	log.Info("Конвертация изображения")
	converted, err := bimg.NewImage(image).Convert(bimg.WEBP)
	return converted, err
}
