DROP INDEX IF EXISTS wishlists_user_id_created_at_idx;
CREATE INDEX IF NOT EXISTS wishlists_user_id_idx ON wishlists (user_id);