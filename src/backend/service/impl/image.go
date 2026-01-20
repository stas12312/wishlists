package impl

import (
	"bytes"
	"fmt"
	"io"
	"main/config"
	"main/repository"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2/log"
	"github.com/h2non/bimg"
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

func (s *ImageServiceImpl) UploadByURL(url string) (string, error) {

	response, err := http.Get(url)
	if err != nil {
		return "", err
	}
	return s.Upload(getNameFromUrl(url), response.Body)

}

func convertImage(image []byte) ([]byte, error) {
	log.Info("Конвертация изображения")
	converted, err := bimg.NewImage(image).Convert(bimg.WEBP)
	return converted, err
}

func getNameFromUrl(url string) string {
	parts := strings.Split(url, "/")
	return parts[len(parts)-1]
}
