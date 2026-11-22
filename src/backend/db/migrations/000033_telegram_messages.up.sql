CREATE TABLE telegram_messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    update_id BIGINT UNIQUE,
    message_id BIGINT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
    kind TEXT NOT NULL,
    text TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX telegram_messages_chat_history_idx ON telegram_messages (chat_id, id DESC);
