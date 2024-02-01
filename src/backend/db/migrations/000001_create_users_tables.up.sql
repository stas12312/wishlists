CREATE TABLE IF NOT EXISTS users
(
    user_id  serial PRIMARY KEY,
    password VARCHAR(60)         NOT NULL,
    email    VARCHAR(300) UNIQUE NOT NULL,
    name     VARCHAR(50)         NOT NULL
);
