package impl

import (
	"main/model"
	"main/repository/mocks"
	"reflect"
	"testing"
)

func TestNewWishlistService(t *testing.T) {

	t.Run("Create service", func(t *testing.T) {
		wlRepository := mocks.NewWishlistRepository(t)
		wRepository := mocks.NewWishRepository(t)

		want := NewWishlistService(wlRepository, wRepository)

		if got := NewWishlistService(wlRepository, wRepository); !reflect.DeepEqual(got, want) {
			t.Errorf("NewWishlistService() = %v, want %v", got, want)
		}
	})
}

func TestWishlistImpl_AddWish(t *testing.T) {

	type args struct {
		userId int64
		wish   *model.Wish
	}
	tests := []struct {
		name           string
		args           args
		want           *model.Wish
		wantErr        bool
		mocksBehaviour func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository)
	}{
		{
			name: "OK",
			args: args{
				userId: 1,
				wish:   &model.Wish{Name: "name", WishlistUuid: "0"},
			},
			want: &model.Wish{
				Name:         "name",
				WishlistUuid: "0",
				UserId:       1,
				Uuid:         "00000000-0000-0000-0000-000000000001",
			},
			wantErr: false,
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {
				wlMock.
					On("GetByUUID", "0").
					Once().
					Return(&model.Wishlist{UserId: 1}, nil)

				wish := &model.Wish{
					Name:         "name",
					WishlistUuid: "0",
				}

				createdWish := *wish
				createdWish.Uuid = "00000000-0000-0000-0000-000000000001"

				wMock.
					On("Create", wish).
					Once().
					Return(&createdWish, nil)
			},
		},
		{
			name: "User isn't wishlist owner",
			args: args{
				userId: 2,
				wish:   &model.Wish{WishlistUuid: "0"},
			},
			wantErr: true,
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {
				wlMock.
					On("GetByUUID", "0").
					Once().
					Return(&model.Wishlist{UserId: 1}, nil)
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			wlRepository := mocks.NewWishlistRepository(t)
			wRepository := mocks.NewWishRepository(t)
			tt.mocksBehaviour(wlRepository, wRepository)

			s := &WishlistImpl{
				WishlistRepository: wlRepository,
				WishRepository:     wRepository,
			}

			got, err := s.AddWish(tt.args.userId, tt.args.wish)
			if (err != nil) != tt.wantErr {
				t.Errorf("AddWish() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("AddWish() got = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWishlistImpl_Create(t *testing.T) {

	type args struct {
		wishlist *model.Wishlist
	}
	tests := []struct {
		name           string
		args           args
		want           *model.Wishlist
		wantErr        bool
		mocksBehaviour func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository)
	}{
		{
			name: "OK",
			args: args{
				wishlist: &model.Wishlist{UserId: 1},
			},
			want: &model.Wishlist{UserId: 1},
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {
				wlMock.
					On("Create", &model.Wishlist{UserId: 1}).
					Once().
					Return(&model.Wishlist{UserId: 1}, nil)
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			wlRepository := mocks.NewWishlistRepository(t)
			wRepository := mocks.NewWishRepository(t)
			tt.mocksBehaviour(wlRepository, wRepository)

			s := &WishlistImpl{
				WishlistRepository: wlRepository,
				WishRepository:     wRepository,
			}
			got, err := s.Create(tt.args.wishlist)
			if (err != nil) != tt.wantErr {
				t.Errorf("Create() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("Create() got = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWishlistImpl_DeleteWish(t *testing.T) {

	type args struct {
		userId   int64
		wishUuid string
	}
	tests := []struct {
		name           string
		args           args
		wantErr        bool
		mocksBehaviour func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository)
	}{
		{
			name: "OK",
			args: args{
				userId:   1,
				wishUuid: "0",
			},
			wantErr: false,
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {
				wMock.
					On("Get", "0").
					Once().
					Return(&model.Wish{UserId: 1}, nil)

				wMock.
					On("Delete", "0").
					Once().
					Return(nil)
			},
		},
		{
			name: "User isn't wish owner",
			args: args{
				userId:   2,
				wishUuid: "0",
			},
			wantErr: true,
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {
				wMock.
					On("Get", "0").
					Once().
					Return(&model.Wish{UserId: 1}, nil)
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			wlRepository := mocks.NewWishlistRepository(t)
			wRepository := mocks.NewWishRepository(t)
			tt.mocksBehaviour(wlRepository, wRepository)

			s := &WishlistImpl{
				WishlistRepository: wlRepository,
				WishRepository:     wRepository,
			}
			if err := s.DeleteWish(tt.args.userId, tt.args.wishUuid); (err != nil) != tt.wantErr {
				t.Errorf("DeleteWish() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestWishlistImpl_GetForUserByUUID(t *testing.T) {

	type args struct {
		userId int64
		uuid   string
	}
	tests := []struct {
		name           string
		mocksBehaviour func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository)
		args           args
		want           *model.Wishlist
		wantErr        bool
	}{
		{
			name: "OK",
			args: args{
				userId: 1,
				uuid:   "0",
			},
			want: &model.Wishlist{Name: "2", UserId: 1},
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {
				wlMock.
					On("GetByUUID", "0").
					Once().
					Return(&model.Wishlist{Name: "2", UserId: 1}, nil)
			},
		},
		{
			name: "User isn't wishlist owner",
			args: args{
				userId: 2,
				uuid:   "0",
			},
			wantErr: true,
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {
				wlMock.
					On("GetByUUID", "0").
					Once().
					Return(&model.Wishlist{Name: "2", UserId: 1}, nil)
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			wlRepository := mocks.NewWishlistRepository(t)
			wRepository := mocks.NewWishRepository(t)
			tt.mocksBehaviour(wlRepository, wRepository)

			s := &WishlistImpl{
				WishlistRepository: wlRepository,
				WishRepository:     wRepository,
			}
			got, err := s.GetForUserByUUID(tt.args.userId, tt.args.uuid)
			if (err != nil) != tt.wantErr {
				t.Errorf("GetForUserByUUID() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("GetForUserByUUID() got = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWishlistImpl_ListForUser(t *testing.T) {

	type args struct {
		userId int64
	}
	tests := []struct {
		name           string
		args           args
		want           []model.Wishlist
		wantErr        bool
		mocksBehaviour func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository)
	}{
		{
			name: "OK",
			args: args{
				userId: 1,
			},
			want: []model.Wishlist{{UserId: 1, Name: "First"}, {UserId: 2, Name: "Second"}},
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {
				wlMock.
					On("ListByUserId", int64(1)).
					Once().
					Return([]model.Wishlist{{UserId: 1, Name: "First"}, {UserId: 2, Name: "Second"}}, nil)
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			wlRepository := mocks.NewWishlistRepository(t)
			wRepository := mocks.NewWishRepository(t)
			tt.mocksBehaviour(wlRepository, wRepository)

			s := &WishlistImpl{
				WishlistRepository: wlRepository,
				WishRepository:     wRepository,
			}
			got, err := s.ListForUser(tt.args.userId)
			if (err != nil) != tt.wantErr {
				t.Errorf("ListForUser() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("ListForUser() got = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWishlistImpl_ListWishesForWishlist(t *testing.T) {

	type args struct {
		userId       int64
		wishlistUuid string
	}
	tests := []struct {
		name           string
		mocksBehaviour func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository)
		args           args
		want           *[]model.Wish
		wantErr        bool
	}{
		{
			name: "OK",
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {
				wlMock.
					On("GetByUUID", "0").
					Once().
					Return(&model.Wishlist{UserId: 1}, nil)

				wMock.
					On("ListForWishlist", "0").
					Once().
					Return(&[]model.Wish{{UserId: 1}, {UserId: 1}}, nil)
			},
			want: &[]model.Wish{{UserId: 1}, {UserId: 1}},
			args: args{
				userId:       1,
				wishlistUuid: "0",
			},
		},
		{
			name: "User isn't wishlist owner",
			args: args{
				userId:       2,
				wishlistUuid: "0",
			},
			wantErr: true,
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {
				wlMock.
					On("GetByUUID", "0").
					Once().
					Return(&model.Wishlist{UserId: 1}, nil)
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			wlRepository := mocks.NewWishlistRepository(t)
			wRepository := mocks.NewWishRepository(t)
			tt.mocksBehaviour(wlRepository, wRepository)

			s := &WishlistImpl{
				WishlistRepository: wlRepository,
				WishRepository:     wRepository,
			}
			got, err := s.ListWishesForWishlist(tt.args.userId, tt.args.wishlistUuid)
			if (err != nil) != tt.wantErr {
				t.Errorf("ListWishesForWishlist() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("ListWishesForWishlist() got = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWishlistImpl_UpdateForUser(t *testing.T) {
	type args struct {
		userId   int64
		wishlist *model.Wishlist
	}
	tests := []struct {
		name           string
		args           args
		mocksBehaviour func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository)
		want           *model.Wishlist
		wantErr        bool
	}{
		{
			name: "OK",
			args: args{
				userId:   1,
				wishlist: &model.Wishlist{Uuid: "0", UserId: 1},
			},
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {
				wlMock.
					On("GetByUUID", "0").
					Return(&model.Wishlist{UserId: 1, Uuid: "0"}, nil)

				wlMock.
					On("Update", &model.Wishlist{Uuid: "0", UserId: 1}).
					Once().
					Return(&model.Wishlist{Uuid: "0", UserId: 1}, nil)
			},
			want: &model.Wishlist{UserId: 1, Uuid: "0"},
		},
		{
			name: "User isn't wishlist owner",
			args: args{
				userId:   2,
				wishlist: &model.Wishlist{Uuid: "0", UserId: 2},
			},
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {
				wlMock.
					On("GetByUUID", "0").
					Return(&model.Wishlist{UserId: 1, Uuid: "0"}, nil)
			},
			wantErr: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			wlRepository := mocks.NewWishlistRepository(t)
			wRepository := mocks.NewWishRepository(t)
			tt.mocksBehaviour(wlRepository, wRepository)
			s := &WishlistImpl{
				WishlistRepository: wlRepository,
				WishRepository:     wRepository,
			}
			got, err := s.UpdateForUser(tt.args.userId, tt.args.wishlist)
			if (err != nil) != tt.wantErr {
				t.Errorf("UpdateForUser() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("UpdateForUser() got = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWishlistImpl_UpdateWish(t *testing.T) {

	type args struct {
		userId int64
		wish   *model.Wish
	}
	tests := []struct {
		name           string
		mocksBehaviour func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository)

		args    args
		want    *model.Wish
		wantErr bool
	}{
		{
			name: "Ok",
			args: args{
				userId: 1,
				wish:   &model.Wish{UserId: 1, Name: "Wish", Uuid: "0"},
			},
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {

				wish := &model.Wish{UserId: 1, Name: "Wish", Uuid: "0"}
				wMock.
					On("Update", wish).
					Once().
					Return(wish, nil)
			},
			want: &model.Wish{UserId: 1, Name: "Wish", Uuid: "0"},
		},
		{
			name: "User can't edit wish",
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {

			},
			args: args{
				userId: 2,
				wish:   &model.Wish{UserId: 1, Name: "Wish", Uuid: "0"},
			},
			wantErr: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			wlRepository := mocks.NewWishlistRepository(t)
			wRepository := mocks.NewWishRepository(t)

			wRepository.
				On("Get", "0").
				Once().
				Return(&model.Wish{UserId: 1}, nil)

			tt.mocksBehaviour(wlRepository, wRepository)
			s := &WishlistImpl{
				WishlistRepository: wlRepository,
				WishRepository:     wRepository,
			}
			got, err := s.UpdateWish(tt.args.userId, tt.args.wish)
			if (err != nil) != tt.wantErr {
				t.Errorf("UpdateWish() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("UpdateWish() got = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWishlistImpl_UserCanEditWishlist(t *testing.T) {
	type args struct {
		userId       int64
		wishlistUuid string
	}
	tests := []struct {
		name           string
		mocksBehaviour func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository)

		args args
		want bool
	}{
		{
			name: "OK",
			args: args{
				userId:       1,
				wishlistUuid: "0",
			},
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {
				wlMock.
					On("GetByUUID", "0").
					Once().
					Return(&model.Wishlist{UserId: 1}, nil)
			},
			want: true,
		},
		{
			name: "User can't edit",
			args: args{
				userId:       2,
				wishlistUuid: "0",
			},
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {
				wlMock.
					On("GetByUUID", "0").
					Once().
					Return(&model.Wishlist{UserId: 1}, nil)
			},
			want: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			wlRepository := mocks.NewWishlistRepository(t)
			wRepository := mocks.NewWishRepository(t)
			tt.mocksBehaviour(wlRepository, wRepository)

			s := &WishlistImpl{
				WishlistRepository: wlRepository,
				WishRepository:     wRepository,
			}
			if got := s.UserCanEditWishlist(tt.args.userId, tt.args.wishlistUuid); got != tt.want {
				t.Errorf("UserCanEditWishlist() = %v, want %v", got, tt.want)
			}
		})
	}
}
