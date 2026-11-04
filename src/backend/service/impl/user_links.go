package impl

import (
	"context"
	apperror "main/error"
	"main/model"
	"main/uof"
	"net/url"
	"strings"
)

func (u *userServiceImpl) GetAuthInfo(ctx context.Context, userId int64) (*model.AuthInfo, error) {
	var info *model.AuthInfo
	err := u.UnitOfWork.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		user, err := store.UserRepository().GetById(userId)
		if err != nil {
			return apperror.NewError(apperror.DatabaseError, "Не удалось получить пользователя")
		}
		links, err := store.OAuthRepository().ListByUserId(userId)
		if err != nil {
			return apperror.NewError(apperror.DatabaseError, "Не удалось получить привязки")
		}
		if links == nil {
			links = []model.OAuthUser{}
		}
		for i := range links {
			links[i].Provider = strings.ToLower(links[i].Provider)
		}
		info = &model.AuthInfo{HasPassword: user.Password != "", HasEmail: strings.TrimSpace(user.Email) != "", Links: links}
		info.Providers = make([]model.AuthProvider, 0)
		if u.Manager != nil {
			for _, provider := range u.Manager.GetProviders() {
				info.Providers = append(info.Providers, model.AuthProvider{Name: strings.ToLower(provider.Name), URL: provider.Url})
			}
		}
		if u.Config != nil {
			bot := strings.TrimPrefix(strings.TrimSpace(u.Config.TelegramBotUsername), "@")
			if bot != "" {
				info.Providers = append(info.Providers, model.AuthProvider{Name: "telegram", URL: "https://t.me/" + url.PathEscape(bot) + "?startapp=link"})
			}
		}
		return nil
	})
	return info, err
}

func (u *userServiceImpl) DeleteOAuthLink(ctx context.Context, userId int64, provider string) error {
	if provider != "yandex" && provider != "telegram" {
		return apperror.NewError(apperror.ValidateError, "Неизвестный сервис")
	}
	return u.UnitOfWork.Do(ctx, func(ctx context.Context, store uof.UnitOfWorkStore) error {
		user, err := store.UserRepository().GetById(userId)
		if err != nil {
			return apperror.NewError(apperror.DatabaseError, "Не удалось получить пользователя")
		}
		if strings.TrimSpace(user.Email) == "" {
			return apperror.NewError(apperror.ValidateError, "Удалить привязку можно только при наличии email")
		}
		if err := store.OAuthRepository().DeleteByUserId(userId, provider); err != nil {
			return apperror.NewError(apperror.DatabaseError, "Не удалось удалить привязку")
		}
		return nil
	})
}
