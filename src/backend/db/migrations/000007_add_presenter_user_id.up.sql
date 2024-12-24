ALTER TABLE wishes ADD presenter_id bigint;
ALTER TABLE wishes ADD FOREIGN KEY (presenter_id) REFERENCES users (user_id);

CREATE INDEX IF NOT EXISTS wishes_presenter_id_idx ON wishes (presenter_id);