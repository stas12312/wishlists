package impl

import (
	"github.com/gofiber/fiber/v2/log"
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
	(name, comment, link, wishlist_uuid, image, desirability, cost, currency)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	RETURNING *
`

	err := r.Connection.Get(
		createdWish, query, wish.Name, wish.Comment, wish.Link,
		wish.WishlistUuid, wish.Image, wish.Desirability, wish.Cost,
		wish.Currency,
	)

	return createdWish, err

}

func (r *WishRepositoryPostgres) Update(wish *model.Wish) (*model.Wish, error) {

	updatedWish := &model.Wish{}

	query := `
	WITH update AS (
		UPDATE wishes SET 
		  	name = $2,
		  	comment = $3,
		  	link = $4,
		  	image = $5,
		  	desirability = $6,
		  	cost = $7,
			wishlist_uuid = $8,
			currency = $9
		WHERE wishes.wish_uuid = $1
		RETURNING *
	)
	SELECT
		update.*,
		wishlists.user_id,
		update.presenter_id IS NOT NULL AS is_reserved
	FROM update
	JOIN wishlists USING (wishlist_uuid)
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
		wish.WishlistUuid,
		wish.Currency,
	)
	if err != nil {
		log.Error(err.Error())
	}
	return updatedWish, err
}

func (r *WishRepositoryPostgres) Get(wishUuid string) (*model.Wish, error) {
	query := `
	SELECT 
		wishes.*, 
		wishlists.user_id,
		wishes.presenter_id IS NOT NULL AS is_reserved,

		users.name AS "user.name",
		users.image AS "user.image",
		users.username AS "user.username",
		users.user_id AS "user.user_id",
		
		wishlists.name AS "wishlist.name",
		wishlists.date AS "wishlist.date"
	
	FROM wishes
	JOIN wishlists USING (wishlist_uuid)
	JOIN users USING (user_id)
	WHERE wish_uuid = $1
`
	wish := &model.Wish{}
	err := r.Connection.Get(wish, query, wishUuid)
	return wish, err
}

func (r *WishRepositoryPostgres) ListForWishlist(wishlistUuid string) (*[]model.Wish, error) {
	query := `
		SELECT 
		    wishes.*, 
		    wishlists.user_id, 
		    wishes.presenter_id IS NOT NULL AS is_reserved
		FROM wishes
		JOIN wishlists USING (wishlist_uuid)
		WHERE 
		    wishlist_uuid = $1
			AND wishes.is_active = True
		ORDER BY created_at DESC 
`
	wishes := &[]model.Wish{}

	err := r.Connection.Select(wishes, query, wishlistUuid)
	return wishes, err
}

func (r *WishRepositoryPostgres) Delete(wishUuid string) error {

	query := `
	-- Окончательное удаление, если вишлист уже в архиве
	WITH delete_wish AS (
		DELETE FROM wishes
		WHERE 
		    wish_uuid = $1
			AND is_active IS FALSE
	),
	-- Перенос в архив
	archive_wish AS (
		UPDATE wishes SET
			is_active = FALSE
		WHERE 
		    wish_uuid = $1
			AND is_active IS TRUE
	)
	SELECT TRUE
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

func (r *WishRepositoryPostgres) SetPresenter(wishUuid string, presenterId model.NullInt64) error {
	q := `
		UPDATE wishes SET
		    presenter_id = $2
		WHERE wish_uuid = $1
`
	_, err := r.Exec(q, wishUuid, presenterId)
	return err
}

func (r *WishRepositoryPostgres) SetFulfilledAt(wishUuid string, fulfilledAt model.NullTime) error {
	q := `
	UPDATE wishes SET
	    fulfilled_at = $2
	WHERE wish_uuid = $1
`
	_, err := r.Exec(q, wishUuid, fulfilledAt)
	return err
}

func (r *WishRepositoryPostgres) ReservedList(userId int64) (*[]model.Wish, error) {
	q := `
	SELECT 
	    wishes.*, 
		wishlists.user_id,
		wishes.presenter_id IS NOT NULL AS is_reserved,

		users.name AS "user.name",
		users.image AS "user.image",
		users.username AS "user.username",
		users.user_id AS "user.user_id",
		
		wishlists.name AS "wishlist.name",
		wishlists.date AS "wishlist.date"
	
	FROM wishes
	JOIN wishlists USING (wishlist_uuid)
	JOIN users USING (user_id)
	WHERE 
		presenter_id = $1	    
		AND wishes.is_active IS TRUE
	ORDER BY created_at DESC
`
	wishes := &[]model.Wish{}

	err := r.Connection.Select(wishes, q, userId)
	return wishes, err
}
