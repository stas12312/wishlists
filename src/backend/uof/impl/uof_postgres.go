package impl

import (
	"context"
	"database/sql"
	"fmt"
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
	oAuthRepository repository.OAuthUserRepository,
) *UowStore {
	return &UowStore{
		userRepository,
		wishlistRepository,
		wishRepository,
		oAuthRepository,
	}
}

type UowStore struct {
	userRepository     repository.UserRepository
	wishlistRepository repository.WishlistRepository
	wishRepository     repository.WishRepository
	oAuthRepository    repository.OAuthUserRepository
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

func (u *UowStore) OAuthRepository() repository.OAuthUserRepository {
	return u.oAuthRepository
}

type UnitOfWorkPostgres struct {
	db      db.DB
	factory func(connection db.Connection) uof.UnitOfWorkStore
}

func (uof *UnitOfWorkPostgres) Do(
	ctx context.Context,
	fn func(ctx context.Context, store uof.UnitOfWorkStore) error,
) (err error) {
	tx, err := uof.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				err = fmt.Errorf("RollbackError: %w: %w", rollbackErr, err)
			}
		}
	}()

	unitOfWorkStore := uof.factory(tx)

	err = fn(ctx, unitOfWorkStore)
	if err != nil {
		return err
	}

	return tx.Commit()

}

func StoreFactory(connection db.Connection) uof.UnitOfWorkStore {
	return NewUofStore(
		impl.NewUserRepositoryImpl(connection),
		impl.NewWishlistRepository(connection),
		impl.NewWishRepositoryImpl(connection),
		impl.NewOAuthPostgresRepository(connection),
	)
}
