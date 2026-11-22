CREATE TABLE notification_push_sends (
    push_send_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    notification_id BIGINT NOT NULL REFERENCES notifications(notification_id) ON DELETE CASCADE,
    subscription_key TEXT NOT NULL,
    provider TEXT NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_error TEXT,
    retryable BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (notification_id, subscription_key)
);

CREATE INDEX notification_push_sends_attempted_idx ON notification_push_sends (attempted_at DESC, push_send_id DESC);
