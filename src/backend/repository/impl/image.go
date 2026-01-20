package impl

import (
	"context"
	"io"
	"main/config"
	"mime"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	s3Config "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func NewS3ImageRepository(config *config.S3Config) *S3ImageRepository {
	cfg, err := s3Config.LoadDefaultConfig(
		context.TODO(),
		s3Config.WithRegion(config.Region),
		s3Config.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(
				config.AccessKey,
				config.SecretAccessKey,
				"",
			),
		),
	)
	if err != nil {
		panic(err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(config.EndpointUrl)
	})

	return &S3ImageRepository{client, config.Bucket, config.Domain}
}

type S3ImageRepository struct {
	*s3.Client
	Bucket string
	Domain string
}

func (r *S3ImageRepository) Upload(filename string, file io.Reader) (string, error) {
	uploader := manager.NewUploader(r.Client)
	_, err := uploader.Upload(context.TODO(), &s3.PutObjectInput{
		Bucket:       aws.String(r.Bucket),
		Key:          aws.String(filename),
		Body:         file,
		CacheControl: aws.String("max-age=15552000,immutable"),
		ContentType:  aws.String(mime.TypeByExtension(filepath.Ext(filename))),
	})
	return strings.Join([]string{r.Domain, filename}, "/"), err

}
