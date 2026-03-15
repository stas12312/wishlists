package repository

import "main/model"

type QuestionRepository interface {
	Create(question *model.Question) (*model.Question, error)
	ListBy(wishUUID string, userId, authorId int64, ids []int64, navigation model.Navigation) ([]model.Question, error)
	CreateAnswer(userId int64, questionId int64, answer string) error
	Counters(userId int64) (int, int, error)
	Update(question *model.Question) error
	DeleteQuestion(questionId int64) error
	DeleteAnswer(AnswerId int64) error
}
