package impl

import (
	"github.com/jmoiron/sqlx"
	"main/model"
)

func NewWishRepositoryImpl(db *sqlx.DB) *WishRepositoryImpl {
	return &WishRepositoryImpl{db}
}

type WishRepositoryImpl struct {
	*sqlx.DB
}

func (r *WishRepositoryImpl) Create(wish *model.Wish) (*model.Wish, error) {
	createdWish := &model.Wish{}

	query := `
	INSERT INTO wishes
	(name, comment, link, wishlist_uuid, image, desirability, cost)
	VALUES ($1, $2, $3, $4, $5, $6, $7)
	RETURNING *
`

	err := r.DB.Get(
		createdWish, query, wish.Name, wish.Comment, wish.Link,
		wish.WishlistUuid, wish.Image, wish.Desirability, wish.Cost,
	)

	return createdWish, err

}

func (r *WishRepositoryImpl) Update(wish *model.Wish) (*model.Wish, error) {

	updatedWish := &model.Wish{}

	query := `
	UPDATE wishes SET 
	                  name = $2,
	                  comment = $3,
	                  link = $4,
	                  image = $5,
	                  desirability = $6,
	                  cost = $7
		
	WHERE wishes.wish_uuid = $1
	RETURNING *
`

	err := r.DB.Get(
		updatedWish, query,
		wish.WishlistUuid,
		wish.Name,
		wish.Cost,
		wish.Link,
		wish.Image,
		wish.Desirability,
		wish.Cost,
	)
	return updatedWish, err
}

func (r *WishRepositoryImpl) Get(wishUuid string) (*model.Wish, error) {
	query := `
		SELECT wishes.*, wishlists.user_id FROM wishes
		JOIN wishlists USING (wishlist_uuid)
		WHERE wish_uuid = $1
`
	wish := &model.Wish{}
	err := r.DB.Get(wish, query, wishUuid)
	return wish, err
}

func (r *WishRepositoryImpl) ListForWishlist(wishlistUuid string) (*[]model.Wish, error) {
	query := `
		SELECT wishes.*, wishlists.user_id FROM wishes
		JOIN wishlists USING (wishlist_uuid)
		WHERE 
		    wishlist_uuid = $1
			AND wishes.is_active = True
`
	wishes := &[]model.Wish{}

	err := r.DB.Select(wishes, query, wishlistUuid)
	return wishes, err
}

func (r *WishRepositoryImpl) Delete(wishUuid string) error {

	query := `
	UPDATE wishes
		SET is_active = FALSE
		WHERE wish_uuid = $1
`
	_, err := r.DB.Exec(query, wishUuid)
	return err
}
