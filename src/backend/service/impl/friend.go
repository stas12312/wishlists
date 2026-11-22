package impl

import (
	"context"
	"database/sql"
	"errors"
	apperror "main/error"
	"main/model"
	"main/repository"
	"main/service"
	"main/uof"

	"github.com/google/uuid"
)

func NewFriendService(
	repository repository.FriendRepository,
	uof uof.UnitOfWork,
	ws service.WSService,
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
	service.WSService
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
	if err := s.Do(context.Background(), func(ctx context.Context, store uof.UnitOfWorkStore) error {
		friends := store.FriendRepository()
		if err := friends.LockFriendRequest(userId, friendId); err != nil {
			return err
		}
		if friends.HasLink(userId, friendId) {
			return apperror.NewError(apperror.WrongRequest, "Пользователь уже ваш друг")
		}
		request, err := friends.GetFriendRequest(userId, friendId)
		if err != nil {
			return err
		}
		if request.FromUserId != 0 {
			return apperror.NewError(apperror.WrongRequest, "Приглашение уже было отправлено")
		}
		if err := friends.CreateFriendRequest(userId, friendId); err != nil {
			return err
		}
		return createFriendNotification(store, userId, friendId, model.NotificationFriendRequested)
	}); err != nil {
		return err
	}

	s.SendMessage(
		friendId,
		model.WSMessage{Event: service.ChangeIncomingFriendsRequests, Data: ""},
	)
	s.SendMessage(friendId, model.WSMessage{Event: service.NotificationsChanged})
	return nil
}

func (s *FriendServiceImpl) RemoveFriend(userId int64, friendId int64) error {
	return s.DeleteFriend(userId, friendId)
}

func (s *FriendServiceImpl) ApplyRequest(userId int64, fromUserId int64) error {
	return s.resolveRequest(userId, fromUserId, 1, model.NotificationFriendAccepted)
}

func (s *FriendServiceImpl) DeclineRequest(userId int64, fromUserId int64) error {
	return s.resolveRequest(userId, fromUserId, 2, model.NotificationFriendDeclined)
}

func (s *FriendServiceImpl) resolveRequest(userId, fromUserId int64, status int, kind string) error {
	if err := s.Do(context.Background(), func(ctx context.Context, store uof.UnitOfWorkStore) error {
		friends := store.FriendRepository()
		if err := friends.LockFriendRequest(userId, fromUserId); err != nil {
			return err
		}
		if err := friends.UpdateFriendRequest(fromUserId, userId, status); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return apperror.NewError(apperror.WrongRequest, "Входящая заявка не найдена")
			}
			return err
		}
		if kind == model.NotificationFriendAccepted {
			if err := friends.CreateFriend(fromUserId, userId); err != nil {
				return err
			}
		}
		return createFriendNotification(store, userId, fromUserId, kind)
	}); err != nil {
		return err
	}
	s.SendMessage(userId, model.WSMessage{Event: service.ChangeIncomingFriendsRequests, Data: ""})
	s.SendMessage(fromUserId, model.WSMessage{Event: service.NotificationsChanged})
	return nil
}

func createFriendNotification(store uof.UnitOfWorkStore, actorId, recipientId int64, kind string) error {
	actor, err := store.UserRepository().GetById(actorId)
	if err != nil {
		return err
	}
	return store.NotificationRepository().Create(model.Notification{
		RecipientId: recipientId,
		Kind:        kind,
		EventKey:    uuid.NewString(),
		ResourceKey: actor.Username,
		EntityTitle: &actor.Name,
	})
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
