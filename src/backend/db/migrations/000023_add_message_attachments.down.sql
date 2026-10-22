ALTER TABLE messages
    DROP CONSTRAINT IF EXISTS messages_content_check;

-- NOT VALID: сообщения только с вложениями остаются в истории с пустым текстом
ALTER TABLE messages
    ADD CONSTRAINT messages_content_check CHECK (length(content) > 0) NOT VALID;

ALTER TABLE messages
    DROP COLUMN IF EXISTS attachments;
