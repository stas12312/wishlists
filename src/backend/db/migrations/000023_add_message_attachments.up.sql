ALTER TABLE messages
    ADD COLUMN attachments JSONB NOT NULL DEFAULT '[]';

ALTER TABLE messages
    DROP CONSTRAINT IF EXISTS messages_content_check;

ALTER TABLE messages
    ADD CONSTRAINT messages_content_check
        CHECK (length(content) > 0 OR jsonb_array_length(attachments) > 0);
