CREATE TYPE MAIL_STATUS_ENUM AS ENUM ('pending', 'sent', 'failed');

CREATE TABLE IF NOT EXISTS mail_logs
(
    mail_log_id BIGSERIAL PRIMARY KEY,
    recipients  TEXT[]           NOT NULL,
    subject     TEXT             NOT NULL,
    -- Очищается из админки для старых писем, сама запись остаётся
    body        TEXT,
    status      MAIL_STATUS_ENUM NOT NULL DEFAULT 'pending',
    error       TEXT,
    created_at  TIMESTAMP                 DEFAULT now(),
    sent_at     TIMESTAMP
);

CREATE INDEX idx_mail_logs_status_id
    ON mail_logs (status, mail_log_id DESC);
