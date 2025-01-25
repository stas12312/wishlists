DROP INDEX IF EXISTS users_email_key;
DROP INDEX IF EXISTS users_username_key;

ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
