package impl

import (
	"fmt"
	"github.com/gofiber/fiber/v2/log"
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

	go func() {
		log.Info(fmt.Sprintf("Send email to %s", toList[0]))
		address := mail.Address{Name: c.Name, Address: c.From}
		message := fmt.Sprintf("From: %s\r\nSubject:%s\r\n%s", address.String(), subject, body)
		if err := smtp.SendMail(c.Host, c.Auth, c.From, toList, []byte(message)); err != nil {
			log.Error(err.Error())
		}
		log.Info(fmt.Sprintf("Email was sended"))
	}()
	return nil
}
