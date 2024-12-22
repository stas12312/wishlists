package impl

import (
	"main/db"
	"main/model"
)

func NewWishlistRepository(connection db.Connection) *WishlistRepositoryPostgres {
	return &WishlistRepositoryPostgres{connection}
}

type WishlistRepositoryPostgres struct {
	db.Connection
}

func (r *WishlistRepositoryPostgres) Create(wishlist *model.Wishlist) (*model.Wishlist, error) {
	q := `
		INSERT INTO wishlists (name, date,description, user_id, visible) 
		VALUES ($1, $2, $3, $4, $5)
		RETURNING *
`
	createdWishlist := &model.Wishlist{}

	err := r.Get(createdWishlist, q,
		wishlist.Name, wishlist.Date, wishlist.Description, wishlist.UserId, wishlist.Visible,
	)
	return createdWishlist, err
}

func (r *WishlistRepositoryPostgres) ListByUserId(userId int64, filter model.WishlistFilter) ([]model.Wishlist, error) {
	q := `
		SELECT 
		    *,
			(
			    SELECT COUNT(*)
			    FROM wishes
			    WHERE wishes.wishlist_uuid = wishlists.wishlist_uuid 
			) as wishes_count
		FROM wishlists
		WHERE 
		    user_id = $1
			AND is_active = $2
		ORDER BY 
		    created_at DESC 
`
	wishlists := make([]model.Wishlist, 0)
	err := r.Select(&wishlists, q, userId, filter.IsActive)
	return wishlists, err
}

func (r *WishlistRepositoryPostgres) GetByUUID(UUID string) (*model.Wishlist, error) {
	q := `
	SELECT 
	    *,
	    (
			SELECT COUNT(*)
			FROM wishes
			WHERE wishes.wishlist_uuid = wishlists.wishlist_uuid 
		) as wishes_count   
	FROM wishlists
	WHERE wishlist_uuid = $1
`
	wishlist := &model.Wishlist{}

	err := r.Get(wishlist, q, UUID)
	return wishlist, err
}

func (r *WishlistRepositoryPostgres) Update(wishlist *model.Wishlist) (*model.Wishlist, error) {
	q := `
	UPDATE wishlists SET
		name = $2,
		description = $3,
		date = $4,
		visible = $5
	WHERE wishlist_uuid = $1
	RETURNING *
`
	updatedWishlist := &model.Wishlist{}

	err := r.Get(
		updatedWishlist, q, wishlist.Uuid, wishlist.Name, wishlist.Description, wishlist.Date, wishlist.Visible,
	)

	return updatedWishlist, err
}

func (r *WishlistRepositoryPostgres) Delete(uuid string) error {
	q := `
	-- Окончательное удаление, если вишлист уже в архиве
	-- перед удалением вишлиста, удаляем желания
	WITH delete_wishes AS (
		DELETE FROM wishes
		WHERE 
			wishlist_uuid = $1
			AND (SELECT is_active FROM wishlists WHERE wishlist_uuid = $1) IS FALSE	
	),
	delete_wishlist AS (
		DELETE FROM wishlists
		WHERE 
		    wishlist_uuid = $1
			AND is_active IS FALSE
	),
	-- Перенос в архив
	archive_wishlist AS (
		UPDATE wishlists SET
			is_active = FALSE
		WHERE 
		    wishlist_uuid = $1
			AND is_active IS TRUE
	)
	SELECT TRUE
`

	_, err := r.Exec(q, uuid)
	return err
}

func (r *WishlistRepositoryPostgres) Restore(uuid string) error {
	q := `
		UPDATE wishlists SET
			is_active = TRUE
		WHERE wishlist_uuid = $1
`
	_, err := r.Exec(q, uuid)
	return err
}
