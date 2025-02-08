package impl

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"io"
	"main/config"
	"strings"
)

func NewS3ImageRepository(config *config.S3Config) *S3ImageRepository {
	s, _ := session.NewSession(
		&aws.Config{
			Region:      &config.Region,
			Credentials: credentials.NewStaticCredentials(config.AccessKey, config.SecretAccessKey, ""),
			Endpoint:    &config.EndpointUrl,
		})

	return &S3ImageRepository{s, config.Bucket, config.Domain}
}

type S3ImageRepository struct {
	*session.Session
	Bucket string
	Domain string
}

func (r *S3ImageRepository) Upload(filename string, file io.Reader) (string, error) {
	uploader := s3manager.NewUploader(r.Session)

	_, err := uploader.Upload(&s3manager.UploadInput{
		Bucket:       aws.String(r.Bucket),
		Key:          aws.String(filename),
		Body:         file,
		CacheControl: aws.String("max-age=15552000,immutable"),
	})
	return strings.Join([]string{r.Domain, filename}, "/"), err

}
