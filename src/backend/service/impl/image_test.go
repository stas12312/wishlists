package impl

import (
	"bytes"
	"io"
	"main/repository/mocks"
	"testing"
)

func TestImageServiceImpl_Upload(t *testing.T) {
	type args struct {
		filename string
		file     io.Reader
	}

	tests := []struct {
		name     string
		filename string
		args     args
		want     string
		wantErr  bool
	}{
		{
			name: "OK",
			args: args{
				filename: "test.img",
				file:     bytes.NewBufferString("string"),
			},
			want: "https://test.s3/images/UUID-string.img",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			imageRepository := mocks.NewImageRepository(t)

			imageRepository.
				On("Upload", "images/UUID-string.img", bytes.NewBufferString("string")).
				Once().
				Return("https://test.s3/images/UUID-string.img", nil)

			s := &ImageServiceImpl{
				UUIDGenerator:   func() string { return "UUID-string" },
				ImageRepository: imageRepository,
			}

			got, err := s.Upload(tt.args.filename, tt.args.file)
			if (err != nil) != tt.wantErr {
				t.Errorf("Upload() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("Upload() got = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestNewImageService(t *testing.T) {

	t.Run("OK", func(t *testing.T) {
		imageRepository := mocks.NewImageRepository(t)
		service := NewImageService(imageRepository, func() string {
			return "0"
		})

		if service.ImageRepository != imageRepository {
			t.Errorf("Incorrect image service")
		}
	})
}
