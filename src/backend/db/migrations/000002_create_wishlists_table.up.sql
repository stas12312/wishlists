CREATE TABLE IF NOT EXISTS wishlists
(
    wishlist_uuid UUID PRIMARY KEY         DEFAULT gen_random_uuid(),
    name          VARCHAR(100) NOT NULL,
    description   VARCHAR(1000)            DEFAULT '',
    date          TIMESTAMP WITH TIME ZONE,
    user_id       BIGINT,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active     BOOLEAN                  DEFAULT TRUE,

    CONSTRAINT FK_wishlists_user_id FOREIGN KEY (user_id)
        REFERENCES users (user_id)
);

CREATE INDEX IF NOT EXISTS wishlists_user_id_idx ON wishlists (user_id);