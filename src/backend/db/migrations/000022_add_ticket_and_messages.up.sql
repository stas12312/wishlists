CREATE TYPE TICKET_STATUS_ENUM AS ENUM ('open', 'resolved', 'closed', 'waiting_info', 'waiting_fix');

CREATE TABLE IF NOT EXISTS conversations
(
    conversation_id BIGSERIAL PRIMARY KEY,
    created_at      TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages
(
    message_id      BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    content         TEXT   NOT NULL CHECK (length(content) > 0),
    created_at      TIMESTAMP DEFAULT now(),
    sender_id       BIGINT NOT NULL,

    CONSTRAINT fk_message_conversation_id FOREIGN KEY (conversation_id)
        REFERENCES conversations (conversation_id) ON DELETE CASCADE,

    CONSTRAINT fk_message_user_id FOREIGN KEY (sender_id)
        REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE TABLE ticket_categories
(
    category_id SERIAL PRIMARY KEY,
    title       TEXT       NOT NULL,
    color       VARCHAR(7) NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE
);


CREATE TABLE IF NOT EXISTS tickets
(
    ticket_id       BIGSERIAL PRIMARY KEY,
    category_id     INT                NOT NULL,
    subject         TEXT               NOT NULL,
    status          TICKET_STATUS_ENUM NOT NULL DEFAULT 'open',
    created_at      TIMESTAMP                   DEFAULT now(),
    closed_at       TIMESTAMP,
    author_id       BIGINT             NOT NULL,
    conversation_id BIGINT             NOT NULL,

    CONSTRAINT fk_ticket_author_id FOREIGN KEY (author_id)
        REFERENCES users (user_id) ON DELETE CASCADE,

    CONSTRAINT fk_ticket_category_id FOREIGN KEY (category_id)
        REFERENCES ticket_categories (category_id) ON DELETE RESTRICT,

    CONSTRAINT fk_ticket_conversation_id FOREIGN KEY (conversation_id)
        REFERENCES conversations (conversation_id) ON DELETE CASCADE,

    CHECK (
        (
            status = 'closed'
                AND closed_at IS NOT NULL
            )
            OR (
            status != 'closed'
            )
        )
);

CREATE INDEX idx_messages_conversation_id
    ON messages (conversation_id);

CREATE INDEX idx_tickets_author_id
    ON tickets (author_id);

CREATE INDEX idx_tickets_category_id
    ON tickets (category_id);

CREATE INDEX idx_tickets_status
    ON tickets (status);
