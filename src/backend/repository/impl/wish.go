package impl

import (
	"main/db"
	"main/model"
)

func NewWishRepositoryImpl(connection db.Connection) *WishRepositoryPostgres {
	return &WishRepositoryPostgres{connection}
}

type WishRepositoryPostgres struct {
	db.Connection
}

func (r *WishRepositoryPostgres) Create(wish *model.Wish) (*model.Wish, error) {
	createdWish := &model.Wish{}

	query := `
	INSERT INTO wishes
	(name, comment, link, wishlist_uuid, image, desirability, cost)
	VALUES ($1, $2, $3, $4, $5, $6, $7)
	RETURNING *
`

	err := r.Connection.Get(
		createdWish, query, wish.Name, wish.Comment, wish.Link,
		wish.WishlistUuid, wish.Image, wish.Desirability, wish.Cost,
	)

	return createdWish, err

}

func (r *WishRepositoryPostgres) Update(wish *model.Wish) (*model.Wish, error) {

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

	err := r.Connection.Get(
		updatedWish, query,
		wish.Uuid,
		wish.Name,
		wish.Comment,
		wish.Link,
		wish.Image,
		wish.Desirability,
		wish.Cost,
	)
	return updatedWish, err
}

func (r *WishRepositoryPostgres) Get(wishUuid string) (*model.Wish, error) {
	query := `
		SELECT wishes.*, wishlists.user_id FROM wishes
		JOIN wishlists USING (wishlist_uuid)
		WHERE wish_uuid = $1
`
	wish := &model.Wish{}
	err := r.Connection.Get(wish, query, wishUuid)
	return wish, err
}

func (r *WishRepositoryPostgres) ListForWishlist(wishlistUuid string) (*[]model.Wish, error) {
	query := `
		SELECT wishes.*, wishlists.user_id FROM wishes
		JOIN wishlists USING (wishlist_uuid)
		WHERE 
		    wishlist_uuid = $1
			AND wishes.is_active = True
`
	wishes := &[]model.Wish{}

	err := r.Connection.Select(wishes, query, wishlistUuid)
	return wishes, err
}

func (r *WishRepositoryPostgres) Delete(wishUuid string) error {

	query := `
	UPDATE wishes
		SET is_active = FALSE
		WHERE wish_uuid = $1
`
	_, err := r.Connection.Exec(query, wishUuid)
	return err
}

func (r *WishRepositoryPostgres) Restore(wishUuid string) error {
	q := `
		UPDATE wishes SET
			is_active = TRUE
		WHERE wish_uuid = $1
`
	_, err := r.Exec(q, wishUuid)
	return err
}
