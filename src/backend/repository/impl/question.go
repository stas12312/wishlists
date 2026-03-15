package impl

import (
	"main/db"
	"main/model"
)

func NewQuestionRepositoryPostgres(connection db.Connection) *QuestionRepositoryPostgres {
	return &QuestionRepositoryPostgres{
		connection,
	}
}

type QuestionRepositoryPostgres struct {
	db.Connection
}

func (r *QuestionRepositoryPostgres) Create(question *model.Question) (*model.Question, error) {
	query := `
	INSERT INTO questions 
	    (author_id, wish_uuid, content, answered_id) 
	VALUES ($1, $2, $3, $4)
	RETURNING *
`
	createdQuestion := &model.Question{}
	err := r.Connection.Get(createdQuestion, query, question.AuthorID, question.WishUUID, question.Content, question.AnsweredId)
	return createdQuestion, err
}

func (r *QuestionRepositoryPostgres) ListBy(wishUUID string, userId int64, authorId int64, ids []int64, navigation model.Navigation) ([]model.Question, error) {
	query := `
		SELECT 
		    questions.*,
		    
			answer.content AS "answer.content",
			answer.created_at AS "answer.created_at",
			answer.answer_id AS "answer.answer_id"
		FROM questions
		LEFT JOIN answers AS answer USING (question_id)
		WHERE 
		    CASE
		        WHEN $1 != '' THEN wish_uuid = $1::uuid
		        WHEN $2 != 0 THEN questions.answered_id = $2
		        WHEN $3 != 0 THEN questions.author_id = $3
		        ELSE TRUE
		    END
		  	AND 
		    CASE 
		        WHEN array_length($4::bigint[], 1) IS NOT NULL THEN questions.question_id = ANY($4::bigint[]) 
		        ELSE TRUE 
		    END
			AND questions.created_at < COALESCE(NULLIF($5, '')::timestamp, NOW())
		ORDER BY questions.created_at DESC
		LIMIT $6
`
	questions := []model.Question{}
	err := r.Connection.Select(&questions, query, wishUUID, userId, authorId, ids, navigation.Cursor[0], navigation.Count)
	return questions, err

}

func (r *QuestionRepositoryPostgres) CreateAnswer(userId int64, questionId int64, answer string) error {

	query := `
		INSERT INTO answers (question_id, author_id, content) 
		VALUES ($1, $2, $3)
`

	_, err := r.Connection.Exec(query, questionId, userId, answer)
	return err
}

func (r *QuestionRepositoryPostgres) Counters(userId int64) (int, int, error) {
	query := `
		SELECT (
			SELECT COUNT(*)
			FROM questions
			WHERE 
			    answered_id = $1
				AND status = 'open'
		) AS waiting,
		(
		    SELECT COUNT(*)
			FROM questions
			WHERE 
			    author_id = $1
				AND status = 'resolved'
			    
		) AS answered
`
	type Response struct {
		Waiting  int `db:"waiting"`
		Answered int `db:"answered"`
	}

	response := &Response{}

	err := r.Connection.Get(response, query, userId)
	return response.Waiting, response.Answered, err
}

func (r *QuestionRepositoryPostgres) Update(question *model.Question) error {
	query := `
	UPDATE questions
	SET 
	    status = $2,
		content = $3
	WHERE 
	    question_id = $1
`
	_, err := r.Connection.Exec(query, question.Id, question.Status, question.Content)
	return err
}

func (r *QuestionRepositoryPostgres) DeleteAnswer(answerId int64) error {
	query := `
	DELETE FROM answers WHERE answer_id = $1
`
	_, err := r.Connection.Exec(query, answerId)
	return err
}

func (r *QuestionRepositoryPostgres) DeleteQuestion(questionId int64) error {
	query := `
		DELETE FROM questions WHERE question_id = $1
	`
	_, err := r.Connection.Exec(query, questionId)
	return err
}
