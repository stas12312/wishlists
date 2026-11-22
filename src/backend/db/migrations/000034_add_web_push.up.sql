ALTER TABLE notification_preferences DROP CONSTRAINT notification_preferences_channel_check;
ALTER TABLE notification_preferences ADD CHECK (channel IN ('email', 'telegram', 'web_push'));

ALTER TABLE notification_deliveries DROP CONSTRAINT notification_deliveries_channel_check;
ALTER TABLE notification_deliveries ADD CHECK (channel IN ('email', 'telegram', 'web_push'));

CREATE TABLE notification_push_subscriptions (
    endpoint TEXT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    auth TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notification_push_subscriptions_user_idx ON notification_push_subscriptions (user_id);
