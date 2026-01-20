package impl

import (
	"main/model"
	"main/repository"
)

func NewFeedService(repository repository.FeedRepository) *FeedService {
	return &FeedService{repository}
}

type FeedService struct {
	repository repository.FeedRepository
}

func (s *FeedService) Get(userId int64, navigation *model.Navigation) ([]model.Wish, error) {
	wishes, err := s.repository.Get(userId, navigation)
	prepareWishes(userId, &wishes)
	return wishes, err
}
