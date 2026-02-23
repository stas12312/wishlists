package impl

import (
	"main/db"
	"main/model"
)

func NewArticlePostgresRepository(connection db.Connection) *ArticlePostgresRepository {
	return &ArticlePostgresRepository{connection}
}

type ArticlePostgresRepository struct {
	db.Connection
}

func (r ArticlePostgresRepository) Create(article *model.Article) (*model.Article, error) {

	query := `
		INSERT INTO articles (title, content, description, slug, image) 
		VALUES ($1, $2, $3, $4, $5)	
		RETURNING *
`
	createdArticle := &model.Article{}

	err := r.Get(
		createdArticle,
		query,
		article.Title,
		article.Content,
		article.Description,
		article.Slug,
		article.Image,
	)
	return createdArticle, err
}

func (r ArticlePostgresRepository) Update(id int64, article *model.Article) (*model.Article, error) {
	query := `
	UPDATE articles 
	SET
		title = $1,
		content = $2,
		description = $3,
		slug = $4,
		image = $5,
		is_published = $6,
		published_at = $7
	WHERE id = $8
	RETURNING *
`
	updatedArticle := &model.Article{}
	err := r.Get(
		updatedArticle,
		query,
		article.Title,
		article.Content,
		article.Description,
		article.Slug,
		article.Image,
		article.IsPublished,
		article.PublishedAt,
		id,
	)
	return updatedArticle, err
}

func (r ArticlePostgresRepository) Delete(id int64) error {

	query := `
		DELETE FROM articles WHERE id = $1
`
	_, err := r.Connection.Exec(query, id)
	return err
}

func (r ArticlePostgresRepository) List(filter *model.ArticleFilter, navigation *model.Navigation) ([]model.Article, error) {
	query := `
		SELECT
		    id,
		    title,
		    slug,
		    description,
		    published_at,
		    created_at,
		    image,
		    is_published
		FROM articles
		WHERE
			CASE WHEN $1 THEN is_published IS TRUE ELSE TRUE END
			AND 
		    	CASE WHEN $1 
		    	    THEN published_at < COALESCE(NULLIF($3, '')::timestamp, now())::timestamp
		    	    ELSE created_at < COALESCE(NULLIF($3, '')::timestamp, now())::timestamp
		    	END
		ORDER BY CASE WHEN $1 THEN published_at ELSE created_at END DESC
		LIMIT $2
		`
	articles := []model.Article{}
	err := r.Connection.Select(&articles, query, filter.IsPublished, navigation.Count, navigation.Cursor[0])
	return articles, err
}

func (r ArticlePostgresRepository) GetBy(id int64, slug string, filter model.ArticleFilter) (*model.Article, error) {

	query := `
	SELECT *
	FROM articles
	WHERE
	    CASE 
	        WHEN $1::int != 0 THEN articles.id = $1:: int
			ELSE articles.slug = $2::text
		END
		AND CASE WHEN $3 THEN is_published IS TRUE ELSE TRUE END
				
`

	article := &model.Article{}
	err := r.Connection.Get(article, query, id, slug, filter.IsPublished)
	return article, err
}
