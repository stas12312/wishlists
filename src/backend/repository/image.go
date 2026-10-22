package repository

import (
	"io"
)

//go:generate mockery --name ImageRepository
type ImageRepository interface {
	Upload(filename string, file io.Reader) (string, error)
	// UploadAttachment сохраняет исходное имя файла, чтобы при скачивании оно не заменялось ключом в S3
	UploadAttachment(filename string, name string, file io.Reader) (string, error)
}
