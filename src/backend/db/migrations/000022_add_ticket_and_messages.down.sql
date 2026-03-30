DROP INDEX IF EXISTS idx_messages_conversation_id;
DROP INDEX IF EXISTS idx_tickets_author_id;
DROP INDEX IF EXISTS idx_tickets_category_id;
DROP INDEX IF EXISTS idx_tickets_status;

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS ticket_categories;
DROP TABLE IF EXISTS conversations;

DROP TYPE IF EXISTS TICKET_STATUS_ENUM;