package impl

import (
	"fmt"
	"main/mail"
	"main/repository"

	"github.com/gofiber/fiber/v2/log"
)

func NewLoggingClient(client mail.MailClient, repository repository.MailLogRepository) *LoggingClient {
	return &LoggingClient{client: client, repository: repository, asynchronous: true}
}

// Обработчику уведомлений нужен результат SMTP для решения о повторной попытке.
func NewSynchronousLoggingClient(client mail.MailClient, repository repository.MailLogRepository) *LoggingClient {
	return &LoggingClient{client: client, repository: repository}
}

type LoggingClient struct {
	client       mail.MailClient
	repository   repository.MailLogRepository
	asynchronous bool
}

func (c LoggingClient) Send(toList []string, subject, body string) error {
	mailLog, err := c.repository.Create(toList, subject, body)
	if err != nil {
		// Сбой журнала не должен мешать отправке кода пользователю
		log.Error(fmt.Sprintf("Failed to create mail log: %s", err))
		mailLog = nil
	}

	send := func() error {
		sendErr := c.client.Send(toList, subject, body)
		if sendErr != nil {
			log.Error(fmt.Sprintf("Failed to send email to %v: %s", toList, sendErr))
		} else {
			log.Info(fmt.Sprintf("Email was sent to %v", toList))
		}

		if mailLog != nil {
			if err := c.repository.SetResult(mailLog.Id, sendErr); err != nil {
				log.Error(fmt.Sprintf("Failed to update mail log %d: %s", mailLog.Id, err))
			}
		}
		return sendErr
	}
	if c.asynchronous {
		go send()
		return nil
	}
	return send()
}
