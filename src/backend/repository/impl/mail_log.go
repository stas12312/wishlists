package impl

import (
	"main/db"
	"main/model"
	"time"

	"github.com/lib/pq"
)

func NewMailLogRepositoryPostgres(connection db.Connection) *MailLogRepositoryPostgres {
	return &MailLogRepositoryPostgres{connection}
}

type MailLogRepositoryPostgres struct {
	db.Connection
}

func (r MailLogRepositoryPostgres) Create(recipients []string, subject, body string) (*model.MailLog, error) {
	query := `
		INSERT INTO mail_logs (recipients, subject, body)
		VALUES ($1, $2, $3)
		RETURNING mail_log_id, recipients, subject, status, error, created_at, sent_at
`
	mailLog := &model.MailLog{}
	err := r.Connection.Get(mailLog, query, pq.StringArray(recipients), subject, body)
	return mailLog, err
}

func (r MailLogRepositoryPostgres) Get(id int64) (*model.MailLog, error) {
	query := `
		SELECT *, body IS NOT NULL AS has_body
		FROM mail_logs
		WHERE mail_log_id = $1
`
	mailLog := &model.MailLog{}
	err := r.Connection.Get(mailLog, query, id)
	return mailLog, err
}

func (r MailLogRepositoryPostgres) SetResult(id int64, sendErr error) error {
	query := `
		UPDATE mail_logs
		SET
			status = CASE WHEN $2::text IS NULL THEN 'sent' ELSE 'failed' END::MAIL_STATUS_ENUM,
			error = $2::text,
			sent_at = CASE WHEN $2::text IS NULL THEN now() END
		WHERE mail_log_id = $1
`
	var errText *string
	if sendErr != nil {
		text := sendErr.Error()
		errText = &text
	}
	_, err := r.Exec(query, id, errText)
	return err
}

func (r MailLogRepositoryPostgres) ClearBodies(olderThan time.Duration) (int64, error) {
	query := `
		UPDATE mail_logs
		SET body = NULL
		WHERE body IS NOT NULL
			AND created_at < now() - make_interval(secs => $1)
`
	result, err := r.Exec(query, olderThan.Seconds())
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

func (r MailLogRepositoryPostgres) List(filters model.MailLogFilters, navigation model.Navigation) ([]model.MailLog, error) {
	query := `
		SELECT
			mail_log_id,
			recipients,
			subject,
			status,
			error,
			created_at,
			sent_at,
			body IS NOT NULL AS has_body
		FROM mail_logs
		WHERE
			($1 = '' OR status = $1::MAIL_STATUS_ENUM)
			AND mail_log_id < COALESCE(NULLIF($2, '')::bigint, 9223372036854775807)
		ORDER BY mail_log_id DESC
		LIMIT $3
`
	mailLogs := []model.MailLog{}
	err := r.Select(&mailLogs, query, filters.Status, navigation.Cursor[0], navigation.Count)
	return mailLogs, err
}
