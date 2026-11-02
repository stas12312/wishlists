ALTER TABLE wishlists
    ADD COLUMN settings JSONB NOT NULL DEFAULT '{}'::jsonb;
