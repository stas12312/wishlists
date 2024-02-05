package repository

import (
	"io"
)

//go:generate mockery --name ImageRepository
type ImageRepository interface {
	Upload(filename string, file io.Reader) (string, error)
}
