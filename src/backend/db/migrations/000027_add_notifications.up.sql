CREATE TABLE notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    recipient_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    event_key TEXT NOT NULL,
    resource_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at TIMESTAMPTZ,
    UNIQUE (recipient_id, kind, event_key)
);
CREATE INDEX notifications_inbox_idx ON notifications (recipient_id, notification_id DESC);
CREATE INDEX notifications_unread_idx ON notifications (recipient_id, kind, resource_key)
    WHERE read_at IS NULL;

CREATE TABLE notification_preferences (
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'telegram')),
    PRIMARY KEY (user_id, kind, channel)
);

CREATE TABLE notification_deliveries (
    notification_id BIGINT NOT NULL REFERENCES notifications(notification_id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'telegram')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
    attempts INT NOT NULL DEFAULT 0,
    available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_error TEXT,
    PRIMARY KEY (notification_id, channel)
);
CREATE INDEX notification_deliveries_pending_idx ON notification_deliveries (available_at)
    WHERE status = 'pending';

CREATE TABLE notification_telegram_chats (
    telegram_user_id TEXT PRIMARY KEY,
    chat_id BIGINT NOT NULL
);
