package impl

import (
	"fmt"
	"io"
	"main/repository"
	"path/filepath"
)

type UUIDGenerator func() string

func NewImageService(
	repository repository.ImageRepository,
	generator UUIDGenerator,
) *ImageServiceImpl {

	return &ImageServiceImpl{repository, generator}
}

type ImageServiceImpl struct {
	repository.ImageRepository
	UUIDGenerator
}

func (s *ImageServiceImpl) Upload(filename string, file io.Reader) (string, error) {

	fileExt := filepath.Ext(filename)
	fullFilename := fmt.Sprintf("images/%s%s", s.UUIDGenerator(), fileExt)

	return s.ImageRepository.Upload(fullFilename, file)
}
