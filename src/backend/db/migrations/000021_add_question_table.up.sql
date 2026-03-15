CREATE TYPE STATUS_ENUM AS ENUM ('open', 'resolved', 'closed');

CREATE TABLE IF NOT EXISTS questions
(
    question_id BIGSERIAL PRIMARY KEY,
    author_id   INTEGER,
    answered_id INTEGER,
    wish_uuid   UUID,
    content     TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    status      STATUS_ENUM DEFAULT 'open',


    CONSTRAINT fk_question_author_id FOREIGN KEY (author_id)
        REFERENCES users (user_id),

    CONSTRAINT fk_wish_uuid FOREIGN KEY (wish_uuid)
        REFERENCES wishes (wish_uuid),

    CONSTRAINT fk_question_answered_id FOREIGN KEY (answered_id)
        REFERENCES users (user_id)
);

CREATE INDEX IF NOT EXISTS questions_created_at_wish_uuid_idx ON questions (wish_uuid, created_at DESC);
CREATE INDEX IF NOT EXISTS questions_created_at_author_id_idx ON questions (author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS questions_created_at_answered_id_idx ON questions (answered_id, created_at DESC);
CREATE INDEX IF NOT EXISTS questions_question_id_idx ON questions (question_id);

CREATE TABLE answers
(
    answer_id   BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL UNIQUE,
    author_id   BIGINT NOT NULL,
    content     TEXT   NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_answers_question FOREIGN KEY (question_id)
        REFERENCES questions (question_id)
);

CREATE INDEX IF NOT EXISTS answers_question_id_idx ON answers (question_id)


