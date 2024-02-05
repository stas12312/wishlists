CREATE TABLE IF NOT EXISTS wishes
(
    wish_uuid     UUID PRIMARY KEY         default gen_random_uuid(),
    name          VARCHAR(50) NOT NULL,
    comment       VARCHAR(512),
    link          VARCHAR(512),
    wishlist_uuid UUID        NOT NULL,
    image         VARCHAR(512),
    desirability  INT,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT now(),
    fulfilled_at  TIMESTAMP,
    cost          NUMERIC(32, 2),
    is_active     BOOL                     DEFAULT TRUE,

    CONSTRAINT FK_wishlist_uuid FOREIGN KEY (wishlist_uuid)
        REFERENCES wishlists (wishlist_uuid)

);


CREATE INDEX IF NOT EXISTS wishes_wishlist_uuid_idx ON wishes (wishlist_uuid);

