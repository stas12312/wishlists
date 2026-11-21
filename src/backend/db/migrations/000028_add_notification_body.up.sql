ALTER TABLE notifications ADD COLUMN body TEXT NOT NULL DEFAULT '';

UPDATE notifications n
SET body = CASE
    WHEN m.content = '' AND jsonb_array_length(m.attachments) > 0 THEN 'К ответу прикреплены файлы'
    ELSE m.content
END
FROM tickets t
JOIN messages m ON m.conversation_id = t.conversation_id
WHERE n.kind = 'support.reply'
  AND n.recipient_id = t.author_id
  AND n.resource_key = t.ticket_id::text
  AND n.event_key = m.message_id::text;
