package impl

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/url"
	"strings"
	"syscall"
	"testing"
)

type diagnosticAPIError struct{ code string }

func (e diagnosticAPIError) Error() string       { return "secret storage response" }
func (e diagnosticAPIError) ErrorCode() string   { return e.code }
func (e diagnosticAPIError) HTTPStatusCode() int { return 403 }

func TestImageFailureDetails(t *testing.T) {
	for _, tc := range []struct {
		name string
		err  error
		want string
	}{
		{"timeout", &url.Error{Op: "Get", URL: "https://secret/photo?token=secret", Err: context.DeadlineExceeded}, "reason=timeout"},
		{"dns", &net.DNSError{Err: "secret", Name: "secret"}, "reason=dns"},
		{"refused", fmt.Errorf("secret: %w", syscall.ECONNREFUSED), "reason=connection_refused"},
		{"proxy", errors.New("proxyconnect tcp: https://user:secret@proxy"), "reason=proxy_connection"},
		{"storage", diagnosticAPIError{"AccessDenied"}, "code=AccessDenied upstream_status=403"},
		{"unsafe storage code", diagnosticAPIError{"secret\nforged log"}, "code=none"},
		{"conversion", errors.New("Unsupported image format: secret"), "reason=unsupported_image_format"},
		{"unknown", errors.New("https://secret/photo?token=secret"), "reason=unknown"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			got := imageFailureDetails(tc.err)
			if !strings.Contains(got, tc.want) || strings.Contains(got, "secret") || strings.ContainsAny(got, "\r\n") {
				t.Fatalf("unexpected diagnostic: %s", got)
			}
		})
	}
}
