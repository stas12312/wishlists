package impl

import (
	apperror "main/error"
	"main/model"
	"main/repository"
	"main/service"

	"github.com/gofiber/fiber/v2/log"
)

func NewQuestionServiceImpl(
	wishlistService service.WishlistService,
	repository repository.QuestionRepository,
	ws service.WSService,
) *QuestionServiceImpl {
	return &QuestionServiceImpl{wishlistService, repository, ws}
}

type QuestionServiceImpl struct {
	service.WishlistService
	repository.QuestionRepository
	service.WSService
}

func (q *QuestionServiceImpl) Create(userId int64, question *model.Question) (*model.Question, error) {

	wish, err := q.WishlistService.GetWish(userId, question.WishUUID)
	if err != nil {
		return nil, err
	}
	question.AnsweredId = wish.UserId
	question.AuthorID = userId

	if question.AuthorID == wish.UserId {
		return nil, apperror.NewError(apperror.WrongRequest, "Нельзя задавать вопрос себе")
	}
	q.WSService.SendMessage(question.AnsweredId, model.WSMessage{Event: service.ChangeQuestionsCount})
	newQuestion, err := q.QuestionRepository.Create(question)
	if err != nil {
		return nil, err
	}

	questions := []model.Question{*newQuestion}
	q.PrepareQuestions(userId, questions)
	return &questions[0], nil
}

func (q *QuestionServiceImpl) ListByWishUUID(userId int64, wishUUID string) ([]model.Question, error) {

	_, err := q.WishlistService.GetWish(userId, wishUUID)
	if err != nil {
		return nil, err
	}
	questions, err := q.QuestionRepository.ListBy(wishUUID, 0, 0, []int64{}, model.Navigation{Cursor: []string{""}, Count: 100})
	q.PrepareQuestions(userId, questions)
	return questions, err
}

func (q *QuestionServiceImpl) ListByUser(userId int64, navigation model.Navigation) ([]model.Question, error) {

	questions, err := q.QuestionRepository.ListBy("", userId, 0, []int64{}, navigation)
	q.PrepareQuestions(userId, questions)
	return questions, err
}

func (q *QuestionServiceImpl) ListByAuthor(userId int64, navigation model.Navigation) ([]model.Question, error) {

	questions, err := q.QuestionRepository.ListBy("", 0, userId, []int64{}, navigation)
	q.PrepareQuestions(userId, questions)
	return questions, err
}

func (q *QuestionServiceImpl) GetById(userId int64, id int64) (*model.Question, error) {

	questions, err := q.QuestionRepository.ListBy("", 0, 0, []int64{id}, model.Navigation{Cursor: []string{""}, Count: 1})
	q.PrepareQuestions(userId, questions)

	if err != nil {
		return nil, err
	}

	if len(questions) == 0 {
		return nil, apperror.NewError(apperror.NotFound, "Вопрос недоступен или был удален")
	}
	return &questions[0], nil
}

func (q *QuestionServiceImpl) CreateAnswer(userId int64, questionId int64, answer string) (*model.Question, error) {

	question, err := q.GetById(userId, questionId)
	if err != nil {
		return nil, err
	}

	wish, err := q.WishlistService.GetWish(userId, question.WishUUID)
	if err != nil {
		return nil, err
	}

	if wish.UserId != userId {
		return nil, apperror.NewError(apperror.WrongRequest, "Вы не можете ответить на вопрос")
	}

	err = q.QuestionRepository.CreateAnswer(userId, questionId, answer)
	if err != nil {
		return nil, err
	}
	question.Status = model.QuestionStatusResolved
	err = q.QuestionRepository.Update(question)
	if err != nil {
		return nil, err
	}
	q.WSService.SendMessage(question.AnsweredId, model.WSMessage{Event: service.ChangeQuestionsCount})
	q.WSService.SendMessage(question.AuthorID, model.WSMessage{Event: service.ChangeQuestionsCount})

	return q.GetById(userId, questionId)
}

func (q *QuestionServiceImpl) Counters(userId int64) (int, int, error) {
	return q.QuestionRepository.Counters(userId)
}

func (q *QuestionServiceImpl) PrepareQuestions(userId int64, questions []model.Question) {

	wishUUIDs := []string{}

	for _, question := range questions {
		wishUUIDs = append(wishUUIDs, question.WishUUID)
	}

	wishes, _ := q.WishlistService.ListWishesByUUIDS(userId, wishUUIDs)
	wishesMap := make(map[string]model.Wish)

	for _, wish := range *wishes {
		wishesMap[wish.Uuid] = wish
	}

	for i := range questions {
		questions[i].Actions = getActionForQuestion(userId, questions[i])
		questionWish := wishesMap[questions[i].WishUUID]
		questions[i].Wish = &questionWish
	}
}

func (q *QuestionServiceImpl) DeleteQuestion(userId, questionId int64) error {
	question, err := q.GetById(userId, questionId)
	if err != nil {
		return err
	}

	if question.AuthorID != userId {
		return apperror.NewError(apperror.WrongRequest, "Нельзя удалить вопрос")
	}
	if question.Answer != nil {
		err = q.QuestionRepository.DeleteAnswer(question.Answer.Id.Int64)
		if err != nil {
			return err
		}
	}
	q.WSService.SendMessage(question.AuthorID, model.WSMessage{Event: service.ChangeQuestionsCount})
	q.WSService.SendMessage(question.AnsweredId, model.WSMessage{Event: service.ChangeQuestionsCount})
	return q.QuestionRepository.DeleteQuestion(questionId)
}

func (q *QuestionServiceImpl) DeleteAnswer(userId, questionId int64) (*model.Question, error) {
	question, err := q.GetById(userId, questionId)
	if err != nil {
		return nil, err
	}

	if question.AnsweredId != userId {
		return nil, apperror.NewError(apperror.WrongRequest, "Вы не можете удалить ответ")
	}
	if question.Answer == nil {
		return nil, apperror.NewError(apperror.WrongRequest, "Не найден ответ")
	}

	if err = q.QuestionRepository.DeleteAnswer(question.Answer.Id.Int64); err != nil {
		return nil, err
	}
	question.Status = model.QuestionStatusOpen
	err = q.QuestionRepository.Update(question)
	if err != nil {
		return nil, err
	}
	q.WSService.SendMessage(question.AuthorID, model.WSMessage{Event: service.ChangeQuestionsCount})
	q.WSService.SendMessage(question.AnsweredId, model.WSMessage{Event: service.ChangeQuestionsCount})
	return q.GetById(userId, questionId)
}

func (q *QuestionServiceImpl) MarkClosed(userId int64, questionIds []int64) error {
	questions, err := q.QuestionRepository.ListBy("", 0, userId, questionIds, model.Navigation{Count: 100, Cursor: []string{""}})
	if err != nil {
		return err
	}
	log.Info(questions)
	for _, question := range questions {
		question.Status = model.QuestionStatusClosed
		_ = q.Update(&question)
	}
	q.WSService.SendMessage(userId, model.WSMessage{Event: service.ChangeQuestionsCount})
	return nil
}

func getActionForQuestion(userId int64, question model.Question) model.QuestionAction {
	return model.QuestionAction{
		Edit:   question.AuthorID == userId && question.Status == model.QuestionStatusOpen,
		Delete: question.AuthorID == userId,
		Answer: question.AnsweredId == userId,
	}
}
