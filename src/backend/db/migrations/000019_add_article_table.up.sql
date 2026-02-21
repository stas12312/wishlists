CREATE TABLE IF NOT EXISTS articles
(
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content JSONB NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP,
    is_published BOOLEAN DEFAULT FALSE,
    image TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS articles_slug ON articles (slug);