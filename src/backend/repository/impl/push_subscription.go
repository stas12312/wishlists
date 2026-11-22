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
        SELECT s.endpoint, s.auth, s.p256dh
        FROM notification_push_subscriptions s
        JOIN users u ON u.user_id = s.user_id
        JOIN notifications n ON n.notification_id = $1 AND n.recipient_id = s.user_id
        LEFT JOIN notification_preferences p ON p.user_id = u.user_id AND p.kind = n.kind AND p.channel = $2
        WHERE u.is_active AND COALESCE(p.enabled, TRUE) AND s.created_at <= n.created_at
    `, delivery.Id, model.NotificationWebPush)
	return subscriptions, err
}
