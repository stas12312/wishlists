CREATE TABLE IF NOT EXISTS oauth_user
(
    provider      TEXT,
    user_id       BIGINT,
    oauth_user_id TEXT,

    UNIQUE (oauth_user_id, provider),
    FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE INDEX IF NOT EXISTS oauth_user_user_id_idx ON oauth_user (user_id);