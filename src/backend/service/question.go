package service

import "main/model"

type QuestionService interface {
	Create(userId int64, question *model.Question) (*model.Question, error)
	ListByWishUUID(userId int64, wishUUID string) ([]model.Question, error)
	ListByAuthor(authorId int64, navigation model.Navigation) ([]model.Question, error)
	ListByUser(wishUserId int64, navigation model.Navigation) ([]model.Question, error)
	GetById(userId, id int64) (*model.Question, error)
	CreateAnswer(userId int64, questionId int64, answer string) (*model.Question, error)
	Counters(userId int64) (int, int, error)
	DeleteQuestion(userId, questionId int64) error
	DeleteAnswer(userId, questionId int64) (*model.Question, error)
	MarkClosed(userId int64, questionIds []int64) error
}
