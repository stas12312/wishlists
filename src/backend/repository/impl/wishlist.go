package impl

import (
	"github.com/jmoiron/sqlx"
	"main/model"
)

func NewWishlistRepository(db *sqlx.DB) *WishlistImpl {
	return &WishlistImpl{db}
}

type WishlistImpl struct {
	*sqlx.DB
}

func (r *WishlistImpl) Create(wishlist *model.Wishlist) (*model.Wishlist, error) {
	q := `
		INSERT INTO wishlists (name, date,description, user_id) 
		VALUES ($1, $2, $3, $4)
		RETURNING *
`
	createdWishlist := &model.Wishlist{}

	err := r.Get(createdWishlist, q, wishlist.Name, wishlist.Date, wishlist.Description, wishlist.UserId)
	return createdWishlist, err
}

func (r *WishlistImpl) ListByUserId(userId int64) ([]model.Wishlist, error) {
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

func (r *WishlistImpl) GetByUUID(UUID string) (*model.Wishlist, error) {
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

func (r *WishlistImpl) Update(wishlist *model.Wishlist) (*model.Wishlist, error) {
	q := `
	UPDATE wishlists SET
		name = $2,
		description = $3,
		date = $4,
		is_active = $5  
	WHERE wishlist_uuid = $1
	RETURNING *
`
	updatedWishlist := &model.Wishlist{}

	err := r.Get(
		updatedWishlist, q, wishlist.Uuid, wishlist.Name, wishlist.Description, wishlist.Date, wishlist.IsActive,
	)

	return wishlist, err
}
