package impl

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"main/config"
	apperror "main/error"
	"main/repository"
	"net/http"
	"net/url"
	"path"
	"path/filepath"
	"time"
)

type UUIDGenerator func() string

func NewImageService(
	repository repository.ImageRepository,
	generator UUIDGenerator,
	features config.Features,
	maxDownloadSize int64,
) *ImageServiceImpl {

	return &ImageServiceImpl{repository, generator, features, maxDownloadSize}
}

type ImageServiceImpl struct {
	repository.ImageRepository
	UUIDGenerator
	config.Features
	MaxDownloadSize int64
}

func (s *ImageServiceImpl) Upload(filename string, file io.Reader) (string, error) {
	buffer, err := io.ReadAll(io.LimitReader(file, s.MaxDownloadSize+1))
	if err != nil {
		return "", err
	}
	if len(buffer) == 0 || int64(len(buffer)) > s.MaxDownloadSize {
		return "", apperror.NewError(apperror.ValidateError, fmt.Sprintf("Размер изображения должен быть от 1 до %d байт", s.MaxDownloadSize))
	}

	extension := filepath.Ext(filename)
	if s.Features.ConvertImageToWebp {
		extension = ".webp"
	}

	fullFilename := fmt.Sprintf("images/%s%s", s.UUIDGenerator(), extension)

	image := bytes.NewReader(buffer)
	if s.Features.ConvertImageToWebp {
		imageBuffer, err := convertImage(buffer)
		if err != nil {
			return "", err
		}
		image = bytes.NewReader(imageBuffer)
	}

	return s.ImageRepository.Upload(fullFilename, image)
}

func (s *ImageServiceImpl) UploadByURL(rawURL string) (string, error) {
	parsed, err := url.Parse(rawURL)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Hostname() == "" || parsed.User != nil {
		return "", errors.New("invalid image URL")
	}
	client := &http.Client{Timeout: 10 * time.Second}
	response, err := client.Get(rawURL)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return "", fmt.Errorf("image download failed: HTTP %d", response.StatusCode)
	}
	return s.Upload(getNameFromUrl(rawURL), response.Body)
}

func getNameFromUrl(rawURL string) string {
	parsed, err := url.Parse(rawURL)
	if err != nil {
		return ""
	}
	return path.Base(parsed.Path)
}
