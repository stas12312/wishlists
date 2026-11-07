package impl

import (
	"context"
	"github.com/gofiber/fiber/v2/log"
	"main/model"
	"main/uof"
)

// Уже выбранный пользователем аватар не заменяем фотографией из Telegram.
func (s *telegramService) importAvatar(ctx context.Context, user *model.User, photoURL string) {
	if user == nil || user.Image != "" || photoURL == "" || s.images == nil {
		return
	}
	imageURL, err := s.images.UploadByURL(photoURL)
	if err != nil {
		log.Warn("Не удалось перенести аватар Telegram в хранилище")
		return
	}
	err = s.work.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		current, err := activeTelegramUser(store, user.Id)
		if err != nil {
			return err
		}
		if current.Image != "" {
			user.Image = current.Image
			return nil
		}
		updated := *current
		updated.Image = imageURL
		if _, err = store.UserRepository().Update(&updated); err != nil {
			return err
		}
		user.Image = imageURL
		return nil
	})
	if err != nil {
		log.Warn("Не удалось сохранить аватар Telegram в профиле")
	}
}
