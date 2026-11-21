package mail

import (
	_ "embed"
	"errors"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
)

//go:embed template/layout.html
var layoutHTML string

var TemplateByName = map[string]string{
	"email_change":   "./mail/template/email_change.html",
	"code":           "./mail/template/code.html",
	"ticket_message": "./mail/template/ticket_message.html",
}

//go:generate mockery --name Client

type MailClient interface {
	Send(toList []string, subject, body string) error
}

func LoadTemplate(name string) (string, error) {
	path, ok := TemplateByName[name]
	if !ok {
		return "", errors.New("template not found")
	}
	path, _ = filepath.Abs(path)

	file, err := os.OpenFile(path, os.O_RDONLY, 0666)
	if err != nil {
		return "", err
	}
	defer func() {
		if err = file.Close(); err != nil {
			log.Fatal(err)
		}
	}()

	body, err := io.ReadAll(file)
	if err != nil {
		return "", err
	}
	return withLayout(string(body)), nil
}

func withLayout(content string) string {
	return strings.Replace(layoutHTML, "<!-- mail-content -->", content, 1)
}

func CompileTemplate(template string, values map[string]string) string {
	result := template
	for k, v := range values {
		result = strings.Replace(result, "{"+k+"}", v, -1)
	}
	return result
}
