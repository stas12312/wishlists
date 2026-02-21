package service

import "main/model"

type ArticleService interface {
	Create(article *model.Article) (*model.Article, error)
	Update(id int64, article *model.Article) (*model.Article, error)
	Publish(id int64) (*model.Article, error)
	Unpublish(id int64) (*model.Article, error)
	Delete(id int64) error
	GetById(id int64) (*model.Article, error)
	GetBySlug(slug string) (*model.Article, error)
	List(filter *model.ArticleFilter, navigation *model.Navigation) ([]model.Article, error)
}
