package repository

//go:generate mockery --name AccountRepository
type AccountRepository interface {
	Delete(userId int64) error
}
