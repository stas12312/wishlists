package impl

import "main/model"

func (r *NotificationRepositoryPostgres) SavePushSubscription(userId int64, subscription model.PushSubscription) (bool, error) {
	result, err := r.conn.Exec(`
        INSERT INTO notification_push_subscriptions (endpoint, user_id, auth, p256dh)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (endpoint) DO UPDATE SET auth = EXCLUDED.auth, p256dh = EXCLUDED.p256dh
        WHERE notification_push_subscriptions.user_id = EXCLUDED.user_id
    `, subscription.Endpoint, userId, subscription.Auth, subscription.P256dh)
	if err != nil {
		return false, err
	}
	count, err := result.RowsAffected()
	return count > 0, err
}

func (r *NotificationRepositoryPostgres) DeletePushSubscription(userId int64, endpoint string) error {
	_, err := r.conn.Exec("DELETE FROM notification_push_subscriptions WHERE user_id = $1 AND endpoint = $2", userId, endpoint)
	return err
}

func (r *NotificationRepositoryPostgres) HasPushSubscription(userId int64, endpoint string) (bool, error) {
	var linked bool
	err := r.conn.Get(&linked, "SELECT EXISTS (SELECT 1 FROM notification_push_subscriptions WHERE user_id = $1 AND endpoint = $2)", userId, endpoint)
	return linked, err
}

func (r *NotificationRepositoryPostgres) PushDeliverySubscriptions(delivery model.NotificationDelivery) ([]model.PushSubscription, error) {
	var subscriptions []model.PushSubscription
	err := r.conn.Select(&subscriptions, `
        SELECT s.endpoint, s.auth, s.p256dh, subscription.key AS subscription_key
        FROM notification_push_subscriptions s
        CROSS JOIN LATERAL (SELECT encode(sha256(convert_to(s.endpoint, 'UTF8')), 'hex') AS key) subscription
        JOIN users u ON u.user_id = s.user_id
        JOIN notifications n ON n.notification_id = $1 AND n.recipient_id = s.user_id
        LEFT JOIN notification_preferences p ON p.user_id = u.user_id AND p.kind = n.kind AND p.channel = $2
        WHERE u.is_active AND COALESCE(p.enabled, TRUE) AND s.created_at <= n.created_at
          AND NOT EXISTS (
              SELECT 1 FROM notification_push_sends sent
              WHERE sent.notification_id = n.notification_id AND sent.subscription_key = subscription.key
                AND NOT sent.retryable
          )
    `, delivery.Id, model.NotificationWebPush)
	return subscriptions, err
}

func (r *NotificationRepositoryPostgres) RecordPushSend(notificationID int64, subscriptionKey, provider, reason string, retryable bool) error {
	_, err := r.conn.Exec(`
        INSERT INTO notification_push_sends (notification_id, subscription_key, provider, last_error, retryable)
        VALUES ($1, $2, $3, NULLIF($4, ''), $5)
        ON CONFLICT (notification_id, subscription_key) DO UPDATE
        SET attempted_at = EXCLUDED.attempted_at, last_error = EXCLUDED.last_error, retryable = EXCLUDED.retryable
        WHERE notification_push_sends.last_error IS NOT NULL
    `, notificationID, subscriptionKey, provider, reason, retryable)
	return err
}

func (r *NotificationRepositoryPostgres) HasPushSends(notificationID int64) (bool, error) {
	var sent bool
	err := r.conn.Get(&sent, "SELECT EXISTS (SELECT 1 FROM notification_push_sends WHERE notification_id = $1 AND last_error IS NULL)", notificationID)
	return sent, err
}
