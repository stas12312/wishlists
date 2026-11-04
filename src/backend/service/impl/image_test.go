package impl

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"main/config"
	apperror "main/error"
	"main/repository/mocks"
	"net/http"
	"strings"
	"testing"
)

func TestImageServiceUploadByURL(t *testing.T) {
	for _, tc := range []struct {
		name    string
		status  int
		body    string
		wantErr bool
	}{
		{name: "success with query", status: http.StatusOK, body: "image"},
		{name: "HTTP error", status: http.StatusNotFound, body: "error", wantErr: true},
		{name: "empty image", status: http.StatusOK, wantErr: true},
		{name: "exact limit", status: http.StatusOK, body: strings.Repeat("x", 16)},
		{name: "oversized image", status: http.StatusOK, body: strings.Repeat("x", 17), wantErr: true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			original := http.DefaultTransport
			t.Cleanup(func() { http.DefaultTransport = original })
			http.DefaultTransport = imageTestTransport(func(r *http.Request) (*http.Response, error) {
				return &http.Response{StatusCode: tc.status, Body: io.NopCloser(strings.NewReader(tc.body)), Header: make(http.Header)}, nil
			})
			repo := mocks.NewImageRepository(t)
			if !tc.wantErr {
				repo.On("Upload", "images/id.jpg", bytes.NewReader([]byte(tc.body))).Return("stored-image", nil).Once()
			}
			s := NewImageService(repo, func() string { return "id" }, config.Features{}, 16)
			got, err := s.UploadByURL("https://example.org/photo.jpg?token=abc")
			if (err != nil) != tc.wantErr {
				t.Fatalf("unexpected error: %v", err)
			}
			if !tc.wantErr && got != "stored-image" {
				t.Fatalf("unexpected stored URL: %s", got)
			}
		})
	}
}

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
				On("Upload", "images/UUID-string.img", bytes.NewReader([]byte("string"))).
				Once().
				Return("https://test.s3/images/UUID-string.img", nil)

			s := &ImageServiceImpl{
				UUIDGenerator:   func() string { return "UUID-string" },
				ImageRepository: imageRepository,
				MaxDownloadSize: 16,
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

func TestImageUploadSizeLimit(t *testing.T) {
	for _, size := range []int{0, 15, 16, 17} {
		t.Run(fmt.Sprintf("size %d", size), func(t *testing.T) {
			repo := mocks.NewImageRepository(t)
			data := []byte(strings.Repeat("x", size))
			allowed := size > 0 && size <= 16
			if allowed {
				repo.On("Upload", "images/id.jpg", bytes.NewReader(data)).Return("stored-image", nil).Once()
			}
			s := NewImageService(repo, func() string { return "id" }, config.Features{}, 16)
			_, err := s.Upload("photo.jpg", bytes.NewReader(data))
			if allowed && err != nil {
				t.Fatal(err)
			}
			if !allowed {
				var appErr *apperror.Error
				if !errors.As(err, &appErr) || appErr.Code != apperror.ValidateError {
					t.Fatalf("expected validation error, got %v", err)
				}
			}
		})
	}
}

func TestNewImageService(t *testing.T) {

	t.Run("OK", func(t *testing.T) {
		imageRepository := mocks.NewImageRepository(t)
		service := NewImageService(imageRepository, func() string {
			return "0"
		},
			config.Features{ConvertImageToWebp: false},
			5242880,
		)

		if service.ImageRepository != imageRepository {
			t.Errorf("Incorrect image service")
		}
	})
}

type imageTestTransport func(*http.Request) (*http.Response, error)

func (f imageTestTransport) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }
