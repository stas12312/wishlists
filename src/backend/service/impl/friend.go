package impl

import (
	"context"
	apperror "main/error"
	"main/model"
	"main/repository"
	"main/service"
	"main/uof"
)

func NewFriendService(
	repository repository.FriendRepository,
	uof uof.UnitOfWork,
	ws service.WS,
) *FriendServiceImpl {
	return &FriendServiceImpl{
		repository,
		uof,
		ws,
	}
}

type FriendServiceImpl struct {
	repository.FriendRepository
	uof.UnitOfWork
	service.WS
}

func (s *FriendServiceImpl) ListOfFriends(userId int64) (*[]model.User, error) {
	return s.FriendRepository.ListFriends(userId)
}

func (s *FriendServiceImpl) FriendRequestList(userId int64) (*[]model.FriendRequest, error) {
	return s.FriendRepository.FriendRequestList(userId)
}

func (s *FriendServiceImpl) AddFriend(userId int64, friendId int64) error {
	if userId == friendId {
		return apperror.NewError(apperror.WrongCode, "Вы не можете добавлять в друзья себя")
	}
	if s.HasLink(userId, friendId) {
		return apperror.NewError(apperror.WrongRequest, "Пользователь уже ваш друг")
	}
	existsRequest, err := s.GetFriendRequest(userId, friendId)
	if err != nil {
		return err
	}
	if existsRequest.FromUserId != 0 {
		return apperror.NewError(apperror.WrongRequest, "Приглашение уже было отправлено")
	}

	s.SendMessage(
		friendId,
		model.WSMessage{Event: service.ChangeIncomingFriendsRequests, Data: ""},
	)
	return s.CreateFriendRequest(userId, friendId)
}

func (s *FriendServiceImpl) RemoveFriend(userId int64, friendId int64) error {
	return s.DeleteFriend(userId, friendId)
}

func (s *FriendServiceImpl) ApplyRequest(userId int64, fromUserId int64) error {
	existsRequest, err := s.GetFriendRequest(userId, fromUserId)

	err = s.Do(context.Background(), func(ctx context.Context, store uof.UnitOfWorkStore) error {
		if err != nil {
			return err
		}
		if existsRequest.ToUserId != userId {
			return apperror.NewError(apperror.WrongRequest, "Вы не можете принять данную заявку")
		}
		if err = s.UpdateFriendRequest(fromUserId, userId, 1); err != nil {
			return err
		}
		s.SendMessage(
			userId,
			model.WSMessage{Event: service.ChangeIncomingFriendsRequests, Data: ""},
		)
		return s.CreateFriend(fromUserId, userId)
	})
	return err

}

func (s *FriendServiceImpl) DeclineRequest(userId int64, fromUserId int64) error {
	existsRequest, err := s.GetFriendRequest(userId, fromUserId)

	err = s.Do(context.Background(), func(ctx context.Context, store uof.UnitOfWorkStore) error {
		if err != nil {
			return err
		}
		if existsRequest.ToUserId != userId {
			return apperror.NewError(apperror.WrongRequest, "Вы не можете отклонить заявку")
		}
		s.SendMessage(
			userId,
			model.WSMessage{Event: service.ChangeIncomingFriendsRequests, Data: ""},
		)
		return s.UpdateFriendRequest(fromUserId, userId, 2)
	})
	return err
}

func (s *FriendServiceImpl) IsFriends(userId int64, friendId int64) bool {
	return s.FriendRepository.HasLink(userId, friendId)
}

func (s *FriendServiceImpl) GetFriendStatus(userId int64, friendId int64) model.FriendStatus {
	if userId == friendId {
		return model.IsYourSelf
	}
	isFriends := s.HasLink(userId, friendId)
	if isFriends {
		return model.IsFriend
	}
	existsRequest, err := s.GetFriendRequest(userId, friendId)
	if err != nil || existsRequest.FromUserId == 0 {
		return model.NoFriend
	}
	if existsRequest.ToUserId == userId {
		return model.HasIncomingRequest
	}
	if existsRequest.FromUserId == userId {
		return model.HasOutcomingRequest
	}
	return model.NoFriend

}

func (s *FriendServiceImpl) GetCounters(userId int64) (model.Counters, error) {
	return s.FriendRepository.GetCounters(userId)
}

func (s *FriendServiceImpl) DeleteRequest(fromUserId int64, toUserId int64) error {
	s.SendMessage(
		toUserId,
		model.WSMessage{Event: service.ChangeIncomingFriendsRequests, Data: ""},
	)
	return s.FriendRepository.DeleteFriendRequest(fromUserId, toUserId)
}
