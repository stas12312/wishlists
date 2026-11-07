package impl

import (
	"context"
	"github.com/gofiber/fiber/v2/log"
	"main/model"
	"main/uof"
	"time"
)

// Уже выбранный пользователем аватар не заменяем фотографией из Telegram.
func (s *telegramService) importAvatar(ctx context.Context, user *model.User, photoURL string) {
	if user == nil {
		return
	}
	reason := ""
	switch {
	case user.Image != "":
		reason = "existing_avatar"
	case photoURL == "":
		reason = "missing_photo_url"
	case s.images == nil:
		reason = "missing_image_service"
	}
	if reason != "" {
		log.Infof("Импорт аватара Telegram пропущен: user_id=%d reason=%s", user.Id, reason)
		return
	}
	started := time.Now()
	log.Infof("Начат импорт аватара Telegram: user_id=%d", user.Id)
	imageURL, err := s.images.UploadByURL(photoURL)
	if err != nil {
		log.Warnf("Не удалось перенести аватар Telegram в хранилище: user_id=%d elapsed_ms=%d %s", user.Id, time.Since(started).Milliseconds(), imageFailureDetails(err))
		return
	}
	stage := "begin_profile"
	keptExisting := false
	err = s.work.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		stage = "load_profile"
		current, err := activeTelegramUser(store, user.Id)
		if err != nil {
			return err
		}
		if current.Image != "" {
			keptExisting = true
			user.Image = current.Image
			stage = "commit_profile"
			return nil
		}
		updated := *current
		updated.Image = imageURL
		stage = "save_profile"
		if _, err = store.UserRepository().Update(&updated); err != nil {
			return err
		}
		user.Image = imageURL
		stage = "commit_profile"
		return nil
	})
	if err != nil {
		log.Warnf("Не удалось сохранить аватар Telegram в профиле: user_id=%d stage=%s elapsed_ms=%d %s", user.Id, stage, time.Since(started).Milliseconds(), imageFailureDetails(err))
		return
	}
	log.Infof("Завершён импорт аватара Telegram: user_id=%d kept_existing=%t elapsed_ms=%d", user.Id, keptExisting, time.Since(started).Milliseconds())
}
