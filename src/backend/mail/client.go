package mail

//go:generate mockery --name Client

type Client interface {
	Send(toList []string, subject, body string) error
}
