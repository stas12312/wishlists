package service

import "main/model"

type FeedService interface {
	Get(userId int64, navigation *model.Navigation) ([]model.Wish, error)
}
