package repository

import "main/model"

type FeedRepository interface {
	Get(userId int64, navigation *model.Navigation) ([]model.Wish, error)
}
