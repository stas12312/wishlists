package model

type PushSubscription struct {
	Endpoint string `db:"endpoint"`
	Auth     string `db:"auth"`
	P256dh   string `db:"p256dh"`
	Key      string `db:"subscription_key"`
}
