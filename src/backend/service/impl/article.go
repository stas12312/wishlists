package impl

import (
	"database/sql"
	"main/model"
	"main/repository"
	"time"
)

func NewArticleService(repository repository.ArticleRepository) *ArticleServiceImpl {
	return &ArticleServiceImpl{repository}
}

type ArticleServiceImpl struct {
	repository repository.ArticleRepository
}

func (s ArticleServiceImpl) Create(article *model.Article) (*model.Article, error) {
	return s.repository.Create(article)
}

func (s ArticleServiceImpl) Update(id int64, article *model.Article) (*model.Article, error) {
	return s.repository.Update(id, article)
}

func (s ArticleServiceImpl) Publish(id int64) (*model.Article, error) {
	article, _ := s.GetById(id)
	article.IsPublished = true
	article.PublishedAt = model.NullTime{NullTime: sql.NullTime{Valid: true, Time: time.Now()}}
	return s.Update(id, article)
}

func (s ArticleServiceImpl) Unpublish(id int64) (*model.Article, error) {
	article, _ := s.GetById(id)
	article.IsPublished = false
	article.PublishedAt = model.NullTime{NullTime: sql.NullTime{Valid: false}}
	return s.Update(id, article)
}

func (s ArticleServiceImpl) Delete(id int64) error {
	return s.repository.Delete(id)
}

func (s ArticleServiceImpl) GetById(id int64) (*model.Article, error) {
	return s.repository.GetBy(id, "", model.ArticleFilter{})
}

func (s ArticleServiceImpl) GetBySlug(slug string) (*model.Article, error) {
	return s.repository.GetBy(0, slug, model.ArticleFilter{IsPublished: true})
}

func (s ArticleServiceImpl) List(filter *model.ArticleFilter, navigation *model.Navigation) ([]model.Article, error) {
	return s.repository.List(filter, navigation)
}
