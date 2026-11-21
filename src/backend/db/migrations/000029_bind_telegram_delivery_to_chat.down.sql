BEGIN;

ALTER TABLE notification_deliveries DROP COLUMN telegram_chat_id;

CREATE TABLE notification_telegram_chats (
    telegram_user_id TEXT PRIMARY KEY,
    chat_id BIGINT NOT NULL
);

INSERT INTO notification_telegram_chats (telegram_user_id, chat_id)
SELECT oauth_user_id, oauth_user_id::bigint
FROM oauth_user
WHERE provider = 'telegram' AND user_id IS NOT NULL AND oauth_user_id IS NOT NULL;

COMMIT;
