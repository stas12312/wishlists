ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR (32) NOT NULL DEFAULT (substr(md5(random()::TEXT), 1, 12)) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';