package mail

//go:generate mockery --name Client

type MailClient interface {
	Send(toList []string, subject, body string) error
}
