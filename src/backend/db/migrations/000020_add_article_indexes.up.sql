CREATE INDEX IF NOT EXISTS articles_created_at ON articles (created_at DESC);
CREATE INDEX IF NOT EXISTS articles_published ON articles (published_at DESC) WHERE published_at IS NOT NULL;