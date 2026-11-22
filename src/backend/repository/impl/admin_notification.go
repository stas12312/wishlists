package impl

import "main/model"

const adminNotificationColumns = `
	n.notification_id, n.recipient_id, u.name AS recipient_name, u.username,
	n.kind, n.entity_title, n.created_at, n.read_at,
	email.status AS email_status, telegram.status AS telegram_status, push.status AS push_status`

const adminNotificationFrom = `
	FROM notifications n
	JOIN users u ON u.user_id = n.recipient_id
	LEFT JOIN notification_deliveries email
	  ON email.notification_id = n.notification_id AND email.channel = 'email'
	LEFT JOIN notification_deliveries telegram
	  ON telegram.notification_id = n.notification_id AND telegram.channel = 'telegram'
	LEFT JOIN notification_deliveries push
	  ON push.notification_id = n.notification_id AND push.channel = 'web_push'`

func (r *NotificationRepositoryPostgres) ListAdmin(filter model.AdminNotificationFilter, limit int) ([]model.AdminNotification, error) {
	if filter.PushSends {
		return r.listAdminPushSends(filter, limit)
	}
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
		      OR ($6 IN ('', 'web_push') AND ($7 = '' AND push.status IS NOT NULL OR push.status = $7))
		      OR ($6 = '' AND $7 = '')
		  )
		  AND ($8::bigint = 0 OR n.recipient_id = $8)
		ORDER BY n.created_at DESC, n.notification_id DESC LIMIT $9`
	items := []model.AdminNotification{}
	err := r.conn.Select(&items, query, filter.Search, filter.Kind, filter.Since,
		filter.Before, filter.BeforeID, filter.Channel, filter.Status, filter.RecipientID, limit)
	return items, err
}

func (r *NotificationRepositoryPostgres) listAdminPushSends(filter model.AdminNotificationFilter, limit int) ([]model.AdminNotification, error) {
	query := `SELECT n.notification_id, n.recipient_id, u.name AS recipient_name, u.username,
		n.kind, n.entity_title, n.created_at, n.read_at,
		s.push_send_id, s.attempted_at AS push_attempted_at, s.provider AS push_provider,
		left(s.subscription_key, 12) AS push_device, s.last_error AS push_send_error,
		CASE WHEN s.last_error IS NULL THEN 'sent' ELSE 'failed' END AS push_status
		FROM notification_push_sends s
		JOIN notifications n ON n.notification_id = s.notification_id
		JOIN users u ON u.user_id = n.recipient_id
		WHERE ($1 = '' OR strpos(lower(u.name), lower($1)) > 0 OR strpos(lower(u.username), lower($1)) > 0)
		  AND ($2 = '' OR n.kind = $2)
		  AND ($3::timestamptz IS NULL OR s.attempted_at >= $3)
		  AND ($4::timestamptz IS NULL OR (s.attempted_at, s.push_send_id) < ($4, $5))
		  AND ($6::bigint = 0 OR n.recipient_id = $6)
		ORDER BY s.attempted_at DESC, s.push_send_id DESC LIMIT $7`
	items := []model.AdminNotification{}
	err := r.conn.Select(&items, query, filter.Search, filter.Kind, filter.Since,
		filter.Before, filter.BeforeID, filter.RecipientID, limit)
	return items, err
}

func (r *NotificationRepositoryPostgres) GetAdmin(id int64) (*model.AdminNotificationDetail, error) {
	query := `SELECT ` + adminNotificationColumns + `,
		n.resource_key, n.body, email.attempts AS email_attempts, email.last_error AS email_error,
		telegram.attempts AS telegram_attempts, telegram.last_error AS telegram_error,
		push.attempts AS push_attempts, push.last_error AS push_error` + adminNotificationFrom + `
		WHERE n.notification_id = $1`
	item := &model.AdminNotificationDetail{PushSends: []model.AdminPushSend{}}
	if err := r.conn.Get(item, query, id); err != nil {
		return nil, err
	}
	err := r.conn.Select(&item.PushSends, `
		SELECT push_send_id, attempted_at, provider, last_error, left(subscription_key, 12) AS device
		FROM notification_push_sends
		WHERE notification_id = $1
		ORDER BY attempted_at DESC, push_send_id DESC
	`, id)
	return item, err
}
