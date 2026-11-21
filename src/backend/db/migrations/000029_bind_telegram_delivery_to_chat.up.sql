BEGIN;

ALTER TABLE notification_deliveries ADD COLUMN telegram_chat_id BIGINT;
DROP TABLE notification_telegram_chats;

COMMIT;
