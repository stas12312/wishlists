CREATE UNIQUE INDEX oauth_user_telegram_user_id_idx
    ON oauth_user (user_id)
    WHERE provider = 'telegram';
