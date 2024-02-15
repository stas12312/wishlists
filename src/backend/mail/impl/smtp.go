package impl

import (
	"fmt"
	"main/config"
	"net/mail"
	"net/smtp"
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

func (c SMTPClient) Send(toList []string, subject, body string) error {

	address := mail.Address{Name: c.Name, Address: c.From}
	message := fmt.Sprintf("From: %s\r\nSubject:%s\r\n%s", address.String(), subject, body)
	return smtp.SendMail(c.Host, c.Auth, c.From, toList, []byte(message))
}
