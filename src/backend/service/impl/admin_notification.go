package impl

import (
	"database/sql"
	"errors"
	apperror "main/error"
	"main/model"

	"github.com/gofiber/fiber/v2/log"
)

func (s *NotificationService) ListAdmin(filter model.AdminNotificationFilter, limit int) ([]model.AdminNotification, error) {
	items, err := s.repository.ListAdmin(filter, limit)
	if err != nil {
		log.Errorf("Не удалось получить журнал уведомлений: %v", err)
		return nil, apperror.NewError(apperror.DatabaseError, "Не удалось загрузить уведомления")
	}
	for i := range items {
		items[i].Title = notificationTemplates[items[i].Kind].title
	}
	return items, nil
}

func (s *NotificationService) GetAdmin(id int64) (*model.AdminNotificationDetail, error) {
	item, err := s.repository.GetAdmin(id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, apperror.NewError(apperror.NotFound, "Уведомление не найдено")
	}
	if err != nil {
		log.Errorf("Не удалось получить уведомление %d: %v", id, err)
		return nil, apperror.NewError(apperror.DatabaseError, "Не удалось загрузить уведомление")
	}
	item.Title = notificationTemplates[item.Kind].title
	return item, nil
}
