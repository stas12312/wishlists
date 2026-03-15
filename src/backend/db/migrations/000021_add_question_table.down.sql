DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS questions;
DROP TYPE STATUS_ENUM;

DROP INDEX IF EXISTS questions_created_at_wish_uuid_idx;
DROP INDEX IF EXISTS questions_created_at_author_id_idx;
DROP INDEX IF EXISTS questions_created_at_answered_id_idx;
DROP INDEX IF EXISTS questions_question_id_idx;
DROP INDEX IF EXISTS answers_question_id_idx;