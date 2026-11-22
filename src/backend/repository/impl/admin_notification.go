package impl

import "main/model"

const adminNotificationColumns = `
	n.notification_id, n.recipient_id, u.name AS recipient_name, u.username,
	n.kind, n.entity_title, n.created_at, n.read_at,
	email.status AS email_status, telegram.status AS telegram_status`

const adminNotificationFrom = `
	FROM notifications n
	JOIN users u ON u.user_id = n.recipient_id
	LEFT JOIN notification_deliveries email
	  ON email.notification_id = n.notification_id AND email.channel = 'email'
	LEFT JOIN notification_deliveries telegram
	  ON telegram.notification_id = n.notification_id AND telegram.channel = 'telegram'`

func (r *NotificationRepositoryPostgres) ListAdmin(filter model.AdminNotificationFilter, limit int) ([]model.AdminNotification, error) {
	query := `SELECT ` + adminNotificationColumns + adminNotificationFrom + `
		WHERE ($1 = '' OR strpos(lower(u.name), lower($1)) > 0 OR strpos(lower(u.username), lower($1)) > 0)
		  AND ($2 = '' OR n.kind = $2)
		  AND ($3::timestamptz IS NULL OR n.created_at >= $3)
		  AND ($4::timestamptz IS NULL OR (n.created_at, n.notification_id) < ($4, $5))
		  AND (
		      ($6 IN ('', 'site') AND ($7 = '' AND $6 = 'site'
		                               OR $7 = 'read' AND n.read_at IS NOT NULL
		                               OR $7 = 'unread' AND n.read_at IS NULL))
		      OR ($6 IN ('', 'email') AND ($7 = '' AND email.status IS NOT NULL OR email.status = $7))
		      OR ($6 IN ('', 'telegram') AND ($7 = '' AND telegram.status IS NOT NULL OR telegram.status = $7))
		      OR ($6 = '' AND $7 = '')
		  )
		  AND ($8::bigint = 0 OR n.recipient_id = $8)
		ORDER BY n.created_at DESC, n.notification_id DESC LIMIT $9`
	items := []model.AdminNotification{}
	err := r.conn.Select(&items, query, filter.Search, filter.Kind, filter.Since,
		filter.Before, filter.BeforeID, filter.Channel, filter.Status, filter.RecipientID, limit)
	return items, err
}

func (r *NotificationRepositoryPostgres) GetAdmin(id int64) (*model.AdminNotificationDetail, error) {
	query := `SELECT ` + adminNotificationColumns + `,
		n.resource_key, n.body, email.attempts AS email_attempts, email.last_error AS email_error,
		telegram.attempts AS telegram_attempts, telegram.last_error AS telegram_error` + adminNotificationFrom + `
		WHERE n.notification_id = $1`
	item := &model.AdminNotificationDetail{}
	err := r.conn.Get(item, query, id)
	return item, err
}
