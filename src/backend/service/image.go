package service

import "io"

type ImageService interface {
	Upload(filename string, file io.Reader) (string, error)
}
