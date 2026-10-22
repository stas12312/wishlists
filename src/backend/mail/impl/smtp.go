package impl

import (
	"fmt"
	"main/config"
	"mime"
	"net/mail"
	"net/smtp"
	"strings"
)

func NewSMPTClient(config *config.SMTPConfig) *SMTPClient {
	auth := smtp.PlainAuth("", config.Username, config.Password, config.Host)

	host := fmt.Sprintf("%s:%d", config.Host, config.Port)

	return &SMTPClient{
		Auth: auth,
		From: config.Username,
		Host: host,
		Name: config.From,
	}
}

type SMTPClient struct {
	smtp.Auth
	Host string
	From string
	Name string
}

type Mail struct {
	Sender  string
	To      []string
	Subject string
	Body    string
}

func (c SMTPClient) Send(toList []string, subject, body string) error {
	address := mail.Address{Name: c.Name, Address: c.From}

	request := Mail{
		Sender:  address.String(),
		To:      toList,
		Subject: subject,
		Body:    body,
	}
	message := BuildMessage(request)
	return smtp.SendMail(c.Host, c.Auth, c.From, toList, []byte(message))
}

func BuildMessage(mail Mail) string {
	msg := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\r\n"
	msg += fmt.Sprintf("From: %s\r\n", mail.Sender)
	msg += fmt.Sprintf("To: %s\r\n", strings.Join(mail.To, ";"))
	msg += fmt.Sprintf("Subject: %s\r\n", mime.QEncoding.Encode("utf-8", mail.Subject))
	msg += fmt.Sprintf("\r\n%s\r\n", mail.Body)

	return msg
}
