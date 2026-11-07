package impl

import (
	"context"
	"crypto/x509"
	"errors"
	"fmt"
	"io"
	"net"
	"regexp"
	"strings"
	"syscall"

	"github.com/gofiber/fiber/v2/log"
)

var diagnosticCodePattern = regexp.MustCompile(`^[A-Za-z0-9_]{1,64}$`)

// Тексты ошибок могут содержать URL с токеном или реквизиты прокси.
// В лог передаём только типы и известные коды, сохраняя исходную ошибку для вызывающего кода.
func imageFailureDetails(err error) string {
	reason := "unknown"
	var networkError net.Error
	var dnsError *net.DNSError
	var certificateError x509.UnknownAuthorityError
	switch {
	case err == nil:
		reason = "none"
	case errors.Is(err, context.DeadlineExceeded), errors.As(err, &networkError) && networkError.Timeout():
		reason = "timeout"
	case errors.Is(err, context.Canceled):
		reason = "canceled"
	case errors.As(err, &dnsError):
		reason = "dns"
	case errors.Is(err, syscall.ECONNREFUSED):
		reason = "connection_refused"
	case errors.Is(err, syscall.ECONNRESET):
		reason = "connection_reset"
	case errors.As(err, &certificateError):
		reason = "tls_certificate"
	case errors.Is(err, io.ErrUnexpectedEOF), errors.Is(err, io.EOF):
		reason = "unexpected_eof"
	case strings.Contains(fmt.Sprint(err), "proxyconnect"), strings.Contains(fmt.Sprint(err), "socks connect"):
		reason = "proxy_connection"
	case strings.Contains(strings.ToLower(fmt.Sprint(err)), "unsupported image format"), strings.Contains(strings.ToLower(fmt.Sprint(err)), "unknown image format"):
		reason = "unsupported_image_format"
	}
	code := "none"
	var apiError interface{ ErrorCode() string }
	var dbError interface{ SQLState() string }
	if errors.As(err, &apiError) && diagnosticCodePattern.MatchString(apiError.ErrorCode()) {
		code = apiError.ErrorCode()
	} else if errors.As(err, &dbError) && diagnosticCodePattern.MatchString(dbError.SQLState()) {
		code = dbError.SQLState()
	}
	status := 0
	var httpError interface{ HTTPStatusCode() int }
	if errors.As(err, &httpError) {
		status = httpError.HTTPStatusCode()
	}
	return fmt.Sprintf("reason=%s error_type=%T code=%s upstream_status=%d", reason, err, code, status)
}

func (s *ImageServiceImpl) logImageFailure(stage string, err error, status int) {
	if s.diagnoseDownloads {
		log.Warnf("Импорт изображения Telegram: stage=%s http_status=%d custom_transport=%t convert_webp=%t %s",
			stage, status, s.downloadTransport != nil, s.ConvertImageToWebp, imageFailureDetails(err))
	}
}
