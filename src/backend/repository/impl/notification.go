package impl

import (
	"database/sql"
	"main/db"
	"main/model"
	"main/repository"
	"time"
)

type NotificationRepositoryPostgres struct {
	conn db.Connection
}

func NewNotificationRepositoryPostgres(conn db.Connection) *NotificationRepositoryPostgres {
	return &NotificationRepositoryPostgres{conn}
}

func (r *NotificationRepositoryPostgres) Create(n model.Notification) error {
	query := `
		WITH inserted AS (
			INSERT INTO notifications (recipient_id, kind, event_key, resource_key, body, entity_title)
			VALUES ($1, $2, $3, $4, $5, NULLIF($6, ''))
			ON CONFLICT (recipient_id, kind, event_key) DO NOTHING
			RETURNING notification_id, recipient_id, kind
		)
		INSERT INTO notification_deliveries (notification_id, channel, telegram_chat_id)
		SELECT inserted.notification_id, channels.channel, o.oauth_user_id::bigint
		FROM inserted
		CROSS JOIN (VALUES ($7::text), ($8::text)) AS channels(channel)
		LEFT JOIN notification_preferences p
		  ON p.user_id = inserted.recipient_id AND p.kind = inserted.kind AND p.channel = channels.channel
		LEFT JOIN oauth_user o ON o.user_id = inserted.recipient_id AND o.provider = $8 AND channels.channel = $8
		  AND pg_input_is_valid(o.oauth_user_id, 'bigint')
		WHERE COALESCE(p.enabled, TRUE)
		  AND (channels.channel <> $8 OR o.oauth_user_id IS NOT NULL)
	`
	_, err := r.conn.Exec(query, n.RecipientId, n.Kind, n.EventKey, n.ResourceKey, n.Body, n.EntityTitle, model.NotificationEmail, model.NotificationTelegram)
	return err
}

func (r *NotificationRepositoryPostgres) List(userId, before int64, limit int) ([]model.Notification, error) {
	items := []model.Notification{}
	query := `
		SELECT * FROM notifications
		WHERE recipient_id = $1 AND ($2 = 0 OR notification_id < $2)
		ORDER BY notification_id DESC LIMIT $3
	`
	err := r.conn.Select(&items, query, userId, before, limit)
	return items, err
}

func (r *NotificationRepositoryPostgres) CountUnread(userId int64) (int, error) {
	var count int
	query := "SELECT count(*) FROM notifications WHERE recipient_id = $1 AND read_at IS NULL"
	err := r.conn.Get(&count, query, userId)
	return count, err
}

func (r *NotificationRepositoryPostgres) MarkAllRead(userId int64) (bool, error) {
	query := `
		UPDATE notifications SET read_at = now()
		WHERE recipient_id = $1 AND read_at IS NULL
	`
	result, err := r.conn.Exec(query, userId)
	if err != nil {
		return false, err
	}
	count, err := result.RowsAffected()
	return count > 0, err
}

func (r *NotificationRepositoryPostgres) MarkReadByIds(userId int64, ids []int64) (bool, error) {
	query := `
		UPDATE notifications SET read_at = now()
		WHERE recipient_id = $1 AND read_at IS NULL
		  AND notification_id = ANY($2::bigint[])
	`
	result, err := r.conn.Exec(query, userId, ids)
	if err != nil {
		return false, err
	}
	count, err := result.RowsAffected()
	return count > 0, err
}

func (r *NotificationRepositoryPostgres) MarkRead(userId int64, kind, resourceKey string, eventKeys []string) (bool, error) {
	query := `
		UPDATE notifications SET read_at = now()
		WHERE recipient_id = $1 AND kind = $2 AND resource_key = $3
		  AND ($4::text[] IS NULL OR event_key = ANY($4::text[]))
		  AND read_at IS NULL
	`
	result, err := r.conn.Exec(query, userId, kind, resourceKey, eventKeys)
	if err != nil {
		return false, err
	}
	count, err := result.RowsAffected()
	return count > 0, err
}

func (r *NotificationRepositoryPostgres) Preferences(userId int64, kinds []string) ([]repository.NotificationPreferenceRow, error) {
	var preferences []repository.NotificationPreferenceRow
	query := `
		SELECT kinds.kind, channels.channel, COALESCE(p.enabled, TRUE) AS enabled,
		       (u.is_active IS TRUE AND CASE channels.channel
		           WHEN $3 THEN NULLIF(u.email, '') IS NOT NULL
		           WHEN $4 THEN COALESCE(pg_input_is_valid(o.oauth_user_id, 'bigint'), FALSE)
		       END) AS available,
		       (channels.channel = $4 AND o.oauth_user_id IS NOT NULL) AS linked
		FROM users u
		CROSS JOIN unnest($2::text[]) AS kinds(kind)
		CROSS JOIN (VALUES ($3::text), ($4::text)) AS channels(channel)
		LEFT JOIN notification_preferences p
		  ON p.user_id = u.user_id AND p.kind = kinds.kind AND p.channel = channels.channel
		LEFT JOIN oauth_user o ON o.user_id = u.user_id AND o.provider = $4
		WHERE u.user_id = $1
	`
	err := r.conn.Select(&preferences, query, userId, kinds, model.NotificationEmail, model.NotificationTelegram)
	return preferences, err
}

func (r *NotificationRepositoryPostgres) SetPreference(userId int64, kind, channel string, enabled bool) error {
	if enabled && channel == model.NotificationTelegram {
		query := `
			INSERT INTO notification_preferences (user_id, kind, channel, enabled)
			SELECT u.user_id, $2, $3, TRUE
			FROM users u
			JOIN oauth_user o ON o.user_id = u.user_id AND o.provider = $3
			  AND pg_input_is_valid(o.oauth_user_id, 'bigint')
			WHERE u.user_id = $1 AND u.is_active
			ON CONFLICT (user_id, kind, channel) DO UPDATE SET enabled = EXCLUDED.enabled
		`
		result, err := r.conn.Exec(query, userId, kind, channel)
		if err != nil {
			return err
		}
		count, err := result.RowsAffected()
		if err == nil && count == 0 {
			return sql.ErrNoRows
		}
		return err
	}
	query := `
		INSERT INTO notification_preferences (user_id, kind, channel, enabled)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id, kind, channel) DO UPDATE SET enabled = EXCLUDED.enabled
	`
	_, err := r.conn.Exec(query, userId, kind, channel, enabled)
	return err
}

func (r *NotificationRepositoryPostgres) ClaimDelivery(channel string) (model.NotificationDelivery, error) {
	var delivery model.NotificationDelivery
	query := `
		WITH candidate AS (
			SELECT notification_id, channel FROM notification_deliveries
			WHERE status = 'pending' AND channel = $1 AND available_at <= now()
			ORDER BY available_at, notification_id, channel
			LIMIT 1 FOR UPDATE SKIP LOCKED
		), claimed AS (
			UPDATE notification_deliveries d
			SET attempts = d.attempts + 1, available_at = now() + INTERVAL '2 minutes'
			FROM candidate c WHERE d.notification_id = c.notification_id AND d.channel = c.channel
			RETURNING d.notification_id, d.channel, d.attempts
		)
		SELECT n.*, claimed.channel, claimed.attempts FROM claimed JOIN notifications n USING (notification_id)
	`
	err := r.conn.Get(&delivery, query, channel)
	return delivery, err
}

func (r *NotificationRepositoryPostgres) CompleteDelivery(d model.NotificationDelivery, status, lastError string, delay time.Duration) error {
	query := `
		UPDATE notification_deliveries
		SET status = $4, last_error = NULLIF($5, ''), available_at = now() + ($6::bigint * INTERVAL '1 second')
		WHERE notification_id = $1 AND channel = $2 AND attempts = $3 AND status = 'pending'
	`
	_, err := r.conn.Exec(query, d.Id, d.Channel, d.Attempts, status, lastError, int64(delay/time.Second))
	return err
}

func (r *NotificationRepositoryPostgres) DeliveryAddress(d model.NotificationDelivery) (string, error) {
	var address string
	query := `
		SELECT CASE d.channel
		    WHEN $4 THEN COALESCE(u.email, '')
		    WHEN $5 THEN COALESCE(o.oauth_user_id, '')
		END
		FROM users u
		JOIN notification_deliveries d ON d.notification_id = $6 AND d.channel = $3
		LEFT JOIN notification_preferences p ON p.user_id = u.user_id AND p.kind = $2 AND p.channel = d.channel
		LEFT JOIN oauth_user o ON o.user_id = u.user_id AND o.provider = $5 AND d.channel = $5
		  AND o.oauth_user_id = d.telegram_chat_id::text
		WHERE u.user_id = $1 AND u.is_active AND COALESCE(p.enabled, TRUE)
	`
	err := r.conn.Get(&address, query, d.RecipientId, d.Kind, d.Channel, model.NotificationEmail, model.NotificationTelegram, d.Id)
	return address, err
}
