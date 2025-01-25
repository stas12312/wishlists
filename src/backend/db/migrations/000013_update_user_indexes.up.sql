ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON users (lower(username));