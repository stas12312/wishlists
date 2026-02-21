package repository

import "main/model"

type ArticleRepository interface {
	Create(article *model.Article) (*model.Article, error)
	Update(id int64, article *model.Article) (*model.Article, error)
	Delete(id int64) error
	List(filter *model.ArticleFilter, navigation *model.Navigation) ([]model.Article, error)
	GetBy(id int64, slug string, filter model.ArticleFilter) (*model.Article, error)
}
