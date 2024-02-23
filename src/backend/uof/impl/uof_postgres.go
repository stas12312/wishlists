package impl

import (
	"context"
	"database/sql"
	"github.com/gofiber/fiber/v2/log"
	"main/db"
	"main/repository"
	"main/repository/impl"
	"main/uof"
)

func NewUnitOfWorkPostgres(
	db db.DB,
	factory func(connection db.Connection) uof.UnitOfWorkStore,
) *UnitOfWorkPostgres {
	return &UnitOfWorkPostgres{db: db, factory: factory}
}

func NewUofStore(
	userRepository repository.UserRepository,
	wishlistRepository repository.WishlistRepository,
	wishRepository repository.WishRepository,
) *UowStore {
	return &UowStore{
		userRepository,
		wishlistRepository,
		wishRepository,
	}
}

type UowStore struct {
	userRepository     repository.UserRepository
	wishlistRepository repository.WishlistRepository
	wishRepository     repository.WishRepository
}

func (u *UowStore) UserRepository() repository.UserRepository {
	return u.userRepository
}

func (u *UowStore) WishlistRepository() repository.WishlistRepository {
	return u.wishlistRepository
}

func (u *UowStore) WishRepository() repository.WishRepository {
	return u.wishRepository
}

type UnitOfWorkPostgres struct {
	db      db.DB
	factory func(connection db.Connection) uof.UnitOfWorkStore
}

func (uof *UnitOfWorkPostgres) Do(
	ctx context.Context,
	fn func(ctx context.Context, store uof.UnitOfWorkStore) error,
) error {
	tx, err := uof.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}
	defer tx.Commit()

	unitOfWorkStore := uof.factory(tx)

	err = fn(ctx, unitOfWorkStore)
	if err != nil {
		rollbackErr := tx.Rollback()
		if rollbackErr != nil {
			log.Panic(rollbackErr.Error())
		}
		return err
	}

	return tx.Commit()

}

func StoreFactory(connection db.Connection) uof.UnitOfWorkStore {
	return NewUofStore(
		impl.NewUserRepositoryImpl(connection),
		impl.NewWishlistRepository(connection),
		impl.NewWishRepositoryImpl(connection),
	)
}
