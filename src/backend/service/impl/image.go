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

	return &ImageServiceImpl{
		ImageRepository: repository,
		UUIDGenerator:   generator,
		Features:        features,
		MaxDownloadSize: maxDownloadSize,
	}
}

type ImageServiceImpl struct {
	repository.ImageRepository
	UUIDGenerator
	config.Features
	MaxDownloadSize   int64
	downloadTransport http.RoundTripper
	diagnoseDownloads bool
}

func (s ImageServiceImpl) WithDownloadTransport(transport http.RoundTripper) *ImageServiceImpl {
	s.downloadTransport = transport
	s.diagnoseDownloads = true
	return &s
}

func (s *ImageServiceImpl) Upload(filename string, file io.Reader) (string, error) {
	buffer, err := io.ReadAll(io.LimitReader(file, s.MaxDownloadSize+1))
	if err != nil {
		s.logImageFailure("read", err, 0)
		return "", err
	}
	if len(buffer) == 0 || int64(len(buffer)) > s.MaxDownloadSize {
		s.logImageFailure("size_limit", nil, 0)
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
			s.logImageFailure("convert", err, 0)
			return "", err
		}
		image = bytes.NewReader(imageBuffer)
	}

	storedURL, err := s.ImageRepository.Upload(fullFilename, image)
	if err != nil {
		s.logImageFailure("storage", err, 0)
	}
	return storedURL, err
}

func (s *ImageServiceImpl) UploadByURL(rawURL string) (string, error) {
	parsed, err := url.Parse(rawURL)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Hostname() == "" || parsed.User != nil {
		s.logImageFailure("validate_url", nil, 0)
		return "", errors.New("invalid image URL")
	}
	client := &http.Client{Transport: s.downloadTransport, Timeout: 10 * time.Second}
	response, err := client.Get(rawURL)
	if err != nil {
		s.logImageFailure("download", err, 0)
		return "", err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		s.logImageFailure("download", nil, response.StatusCode)
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
