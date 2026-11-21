package impl

import (
	"crypto/tls"
	"errors"
	"fmt"
	"main/config"
	"mime"
	"net"
	"net/mail"
	"net/smtp"
	"strings"
	"time"
)

func NewSMPTClient(config *config.SMTPConfig) *SMTPClient {
	auth := smtp.PlainAuth("", config.Username, config.Password, config.Host)

	host := net.JoinHostPort(config.Host, fmt.Sprint(config.Port))

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
	return c.send(toList, []byte(message))
}

func (c SMTPClient) send(recipients []string, message []byte) error {
	host, _, err := net.SplitHostPort(c.Host)
	if err != nil {
		return err
	}
	deadline := time.Now().Add(20 * time.Second)
	dialer := net.Dialer{Deadline: deadline}
	conn, err := dialer.Dial("tcp", c.Host)
	if err != nil {
		return err
	}
	defer conn.Close()
	if err := conn.SetDeadline(deadline); err != nil {
		return err
	}
	client, err := smtp.NewClient(conn, host)
	if err != nil {
		return err
	}
	if supported, _ := client.Extension("STARTTLS"); supported {
		if err := client.StartTLS(&tls.Config{ServerName: host}); err != nil {
			return err
		}
	}
	if c.Auth != nil {
		if supported, _ := client.Extension("AUTH"); !supported {
			return errors.New("SMTP-сервер не поддерживает авторизацию")
		}
		if err := client.Auth(c.Auth); err != nil {
			return err
		}
	}
	if err := client.Mail(c.From); err != nil {
		return err
	}
	for _, recipient := range recipients {
		if err := client.Rcpt(recipient); err != nil {
			return err
		}
	}
	writer, err := client.Data()
	if err != nil {
		return err
	}
	if _, err := writer.Write(message); err != nil {
		return err
	}
	if err := writer.Close(); err != nil {
		return err
	}
	_ = client.Quit()
	return nil
}

func BuildMessage(mail Mail) string {
	msg := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\r\n"
	msg += fmt.Sprintf("From: %s\r\n", mail.Sender)
	msg += fmt.Sprintf("To: %s\r\n", strings.Join(mail.To, ";"))
	msg += fmt.Sprintf("Subject: %s\r\n", mime.QEncoding.Encode("utf-8", mail.Subject))
	msg += fmt.Sprintf("\r\n%s\r\n", mail.Body)

	return msg
}
