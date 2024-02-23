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
		INSERT INTO wishlists (name, date,description, user_id) 
		VALUES ($1, $2, $3, $4)
		RETURNING *
`
	createdWishlist := &model.Wishlist{}

	err := r.Get(createdWishlist, q, wishlist.Name, wishlist.Date, wishlist.Description, wishlist.UserId)
	return createdWishlist, err
}

func (r *WishlistRepositoryPostgres) ListByUserId(userId int64) ([]model.Wishlist, error) {
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
			AND is_active IS TRUE
		ORDER BY created_at
`
	wishlists := make([]model.Wishlist, 0)
	err := r.Select(&wishlists, q, userId)
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
		date = $4
	WHERE wishlist_uuid = $1
	RETURNING *
`
	updatedWishlist := &model.Wishlist{}

	err := r.Get(
		updatedWishlist, q, wishlist.Uuid, wishlist.Name, wishlist.Description, wishlist.Date,
	)

	return updatedWishlist, err
}

func (r *WishlistRepositoryPostgres) Delete(uuid string) error {
	q := `
	UPDATE wishlists SET
		is_active = FALSE
	WHERE wishlist_uuid = $1
`

	_, err := r.Exec(q, uuid)
	return err
}
