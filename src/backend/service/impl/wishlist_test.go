package impl

import (
	"database/sql"
	"fmt"
	"main/model"
	"main/repository/mocks"
	"main/service"
	mocks2 "main/service/mocks"
	"reflect"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
)

func TestNewWishlistService(t *testing.T) {

	t.Run("Create service", func(t *testing.T) {
		wlRepository := mocks.NewWishlistRepository(t)
		wRepository := mocks.NewWishRepository(t)
		uService := mocks2.NewUserService(t)
		fService := mocks2.NewFriendService(t)
		wsService := mocks2.NewWSService(t)
		want := NewWishlistService(wlRepository, wRepository, uService, fService, wsService)

		if got := NewWishlistService(wlRepository, wRepository, uService, fService, wsService); !reflect.DeepEqual(got, want) {
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
		mocksBehaviour func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository, wsMock *mocks2.WSService)
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
				Actions: model.WishActions{
					Edit:     true,
					MakeFull: true,
				},
			},
			wantErr: false,
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository, wsMock *mocks2.WSService) {
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

				wsMock.
					On("SendMessageToChannel",
						"wishlist_0",
						model.WSMessage{Event: service.Update},
					).
					Once().
					Return()
			},
		},
		{
			name: "User isn't wishlist owner",
			args: args{
				userId: 2,
				wish:   &model.Wish{WishlistUuid: "0"},
			},
			wantErr: true,
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository, wsMock *mocks2.WSService) {
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
			wsService := mocks2.NewWSService(t)
			tt.mocksBehaviour(wlRepository, wRepository, wsService)

			s := &WishlistImpl{
				WishlistRepository: wlRepository,
				WishRepository:     wRepository,
				WSService:          wsService,
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
		mocksBehaviour func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository, wsMock *mocks2.WSService)
	}{
		{
			name: "OK",
			args: args{
				userId:   1,
				wishUuid: "0",
			},
			wantErr: false,
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository, wsMock *mocks2.WSService) {
				fakeUuid, _ := uuid.NewUUID()
				wMock.
					On("Get", "0").
					Once().
					Return(&model.Wish{UserId: 1, WishlistUuid: fakeUuid.String()}, nil)

				wMock.
					On("Delete", "0").
					Once().
					Return(nil)

				wsMock.
					On("SendMessageToChannel",
						fmt.Sprintf("wishlist_%s", fakeUuid.String()),
						model.WSMessage{Event: service.Update},
					).
					Once().
					Return()
			},
		},
		{
			name: "User isn't wish owner",
			args: args{
				userId:   2,
				wishUuid: "0",
			},
			wantErr: true,
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository, wsMock *mocks2.WSService) {
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
			wsService := mocks2.NewWSService(t)
			tt.mocksBehaviour(wlRepository, wRepository, wsService)

			s := &WishlistImpl{
				WishlistRepository: wlRepository,
				WishRepository:     wRepository,
				WSService:          wsService,
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
		mocksBehaviour func(
			wlMock *mocks.WishlistRepository,
			wMock *mocks.WishRepository,
			uService *mocks2.UserService,
		)
		args    args
		want    *model.Wishlist
		wantErr bool
	}{
		{
			name: "OK",
			args: args{
				userId: 1,
				uuid:   "0",
			},
			want: &model.Wishlist{Name: "2", UserId: 1, User: &model.User{Id: 1}, IsActive: true},
			mocksBehaviour: func(
				wlMock *mocks.WishlistRepository,
				wMock *mocks.WishRepository,
				uService *mocks2.UserService,
			) {
				wlMock.
					On("GetByUUID", "0").
					Once().
					Return(&model.Wishlist{Name: "2", UserId: 1, IsActive: true}, nil)
				uService.
					On("GetById", mock.Anything, int64(1)).
					Once().
					Return(&model.User{Id: 1}, nil)
			},
		},
		{
			name: "User isn't wishlist owner",
			args: args{
				userId: 2,
				uuid:   "0",
			},
			wantErr: true,
			mocksBehaviour: func(
				wlMock *mocks.WishlistRepository,
				wMock *mocks.WishRepository,
				uService *mocks2.UserService,
			) {
				wlMock.
					On("GetByUUID", "0").
					Once().
					Return(&model.Wishlist{Name: "2", UserId: 1, IsActive: true}, nil)
				uService.
					On("GetById", mock.Anything, int64(1)).
					Once().
					Return(&model.User{Id: 1}, nil)
			},
		},
		{
			name: "Public wishlist",
			args: args{
				userId: 2,
				uuid:   "0",
			},
			want: &model.Wishlist{Name: "2", UserId: 1, Visible: model.Public, User: &model.User{Id: 1}, IsActive: true},
			mocksBehaviour: func(
				wlMock *mocks.WishlistRepository,
				wMock *mocks.WishRepository,
				uService *mocks2.UserService,
			) {
				wlMock.
					On("GetByUUID", "0").
					Once().
					Return(&model.Wishlist{Name: "2", UserId: 1, Visible: model.Public, IsActive: true}, nil)
				uService.
					On("GetById", mock.Anything, int64(1)).
					Once().
					Return(&model.User{Id: 1}, nil)
			},
		},
		{
			name: "Archive wishlist",
			args: args{
				userId: 2,
				uuid:   "0",
			},
			wantErr: true,
			mocksBehaviour: func(
				wlMock *mocks.WishlistRepository,
				wMock *mocks.WishRepository,
				uService *mocks2.UserService,
			) {
				wlMock.
					On("GetByUUID", "0").
					Once().
					Return(&model.Wishlist{Name: "1", UserId: 1, Visible: model.Public, IsActive: false}, nil)
				uService.
					On("GetById", mock.Anything, int64(1)).
					Once().
					Return(&model.User{Id: 1}, nil)
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			wlRepository := mocks.NewWishlistRepository(t)
			wRepository := mocks.NewWishRepository(t)
			uService := &mocks2.UserService{}
			tt.mocksBehaviour(wlRepository, wRepository, uService)

			s := &WishlistImpl{
				WishlistRepository: wlRepository,
				WishRepository:     wRepository,
				UserService:        uService,
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

func TestWishlistImpl_List(t *testing.T) {

	type args struct {
		userId int64
		filter model.WishlistFilter
	}
	tests := []struct {
		name           string
		args           args
		want           []model.Wishlist
		wantErr        bool
		mocksBehaviour func(
			wlMock *mocks.WishlistRepository,
			wMock *mocks.WishRepository,
			fMock *mocks2.FriendService,
		)
	}{
		{
			name: "OK",
			args: args{
				userId: 1,
				filter: model.WishlistFilter{IsActive: true, UserId: 2},
			},
			want: []model.Wishlist{{UserId: 1, Name: "First"}, {UserId: 2, Name: "Second"}},
			mocksBehaviour: func(
				wlMock *mocks.WishlistRepository,
				wMock *mocks.WishRepository,
				fMock *mocks2.FriendService,
			) {
				wlMock.
					On("List",
						int64(1), model.WishlistFilter{IsActive: true, UserId: 2}, model.Navigation{},
					).
					Once().
					Return([]model.Wishlist{{UserId: 1, Name: "First"}, {UserId: 2, Name: "Second"}}, nil)
				fMock.
					On("IsFriends", int64(1), int64(2)).
					Once().
					Return(false)
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			wlRepository := mocks.NewWishlistRepository(t)
			wRepository := mocks.NewWishRepository(t)
			fService := mocks2.NewFriendService(t)
			tt.mocksBehaviour(wlRepository, wRepository, fService)

			s := &WishlistImpl{
				WishlistRepository: wlRepository,
				WishRepository:     wRepository,
				FriendService:      fService,
			}
			got, err := s.ListForUser(tt.args.userId, tt.args.filter, model.Navigation{})
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
			want: &[]model.Wish{
				{UserId: 1, Actions: model.WishActions{Edit: true, MakeFull: true}},
				{UserId: 1, Actions: model.WishActions{Edit: true, MakeFull: true}},
			},
			args: args{
				userId:       1,
				wishlistUuid: "0",
			},
		},
		{
			name: "User isn't private wishlist owner",
			args: args{
				userId:       2,
				wishlistUuid: "0",
			},
			wantErr: true,
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {
				wlMock.
					On("GetByUUID", "0").
					Once().
					Return(&model.Wishlist{UserId: 1, Visible: model.Private}, nil)
			},
			want: &[]model.Wish{},
		},
		{
			name: "Get public wishlist",
			args: args{
				userId:       0,
				wishlistUuid: "0",
			},
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository) {
				wlMock.
					On("GetByUUID", "0").
					Once().
					Return(&model.Wishlist{UserId: 1, Visible: model.Public, IsActive: true}, nil)

				wMock.
					On("ListForWishlist", "0").
					Once().
					Return(&[]model.Wish{{UserId: 1}, {UserId: 1}}, nil)
			},
			want: &[]model.Wish{{UserId: 1}, {UserId: 1}},
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
		mocksBehaviour func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository, uMock *mocks2.UserService)
		want           *model.Wishlist
		wantErr        bool
	}{
		{
			name: "OK",
			args: args{
				userId:   1,
				wishlist: &model.Wishlist{Uuid: "0", UserId: 1},
			},
			mocksBehaviour: func(
				wlMock *mocks.WishlistRepository,
				wMock *mocks.WishRepository,
				uMock *mocks2.UserService,
			) {
				uMock.
					On("GetById", mock.Anything, int64(1)).
					Return(&model.User{Id: 1, Email: "email"}, nil)

				wlMock.
					On("GetByUUID", "0").
					Return(&model.Wishlist{UserId: 1, Uuid: "0"}, nil)

				wlMock.
					On("Update", &model.Wishlist{Uuid: "0", UserId: 1}).
					Once().
					Return(&model.Wishlist{Uuid: "0", UserId: 1}, nil)

			},
			want: &model.Wishlist{UserId: 1, Uuid: "0", User: &model.User{Id: 1, Email: ""}},
		},
		{
			name: "User isn't wishlist owner",
			args: args{
				userId:   2,
				wishlist: &model.Wishlist{Uuid: "0", UserId: 2},
			},
			mocksBehaviour: func(
				wlMock *mocks.WishlistRepository,
				wMock *mocks.WishRepository,
				uMock *mocks2.UserService,
			) {
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
			uService := mocks2.NewUserService(t)
			tt.mocksBehaviour(wlRepository, wRepository, uService)
			s := &WishlistImpl{
				WishlistRepository: wlRepository,
				WishRepository:     wRepository,
				UserService:        uService,
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
		mocksBehaviour func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository, wsMock *mocks2.WSService)

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
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository, wsMock *mocks2.WSService) {
				wish := &model.Wish{UserId: 1, Name: "Wish", Uuid: "0", WishlistUuid: "0000"}

				wMock.
					On("Update", wish).
					Once().
					Return(wish, nil)

				wsMock.
					On("SendMessageToChannel",
						"wishlist_0000",
						model.WSMessage{Event: service.Update}).
					Once().
					Return()
			},
			want: &model.Wish{
				UserId:       1,
				Name:         "Wish",
				Uuid:         "0",
				Actions:      model.WishActions{Edit: true, MakeFull: true},
				WishlistUuid: "0000",
			},
		},
		{
			name: "User can't edit wish",
			mocksBehaviour: func(wlMock *mocks.WishlistRepository, wMock *mocks.WishRepository, wsMock *mocks2.WSService) {

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
				Return(&model.Wish{UserId: 1, WishlistUuid: "0000"}, nil)
			wsService := mocks2.NewWSService(t)

			tt.mocksBehaviour(wlRepository, wRepository, wsService)
			s := &WishlistImpl{
				WishlistRepository: wlRepository,
				WishRepository:     wRepository,
				WSService:          wsService,
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

func TestWishlistImpl_DeleteWishlist(t *testing.T) {
	type args struct {
		userId       int64
		wishlistUuid string
	}
	tests := []struct {
		name           string
		mocksBehaviour func(wlMock *mocks.WishlistRepository)
		args           args
		wantErr        bool
	}{
		{
			name: "OK",
			args: args{
				userId:       1,
				wishlistUuid: "uuid",
			},
			mocksBehaviour: func(wlMock *mocks.WishlistRepository) {
				wlMock.
					On("GetByUUID", "uuid").
					Once().
					Return(&model.Wishlist{UserId: 1}, nil)

				wlMock.
					On("Delete", "uuid").
					Once().
					Return(nil)

			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			wlRepository := mocks.NewWishlistRepository(t)
			wRepository := mocks.NewWishRepository(t)
			tt.mocksBehaviour(wlRepository)

			s := &WishlistImpl{
				WishlistRepository: wlRepository,
				WishRepository:     wRepository,
			}
			if err := s.DeleteWishlist(tt.args.userId, tt.args.wishlistUuid); (err != nil) != tt.wantErr {
				t.Errorf("DeleteWishlist() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestWishlistImpl_CopyWish(t *testing.T) {

	type args struct {
		userId         int64
		wishUuid       string
		toWishlistUuid string
	}
	tests := []struct {
		name           string
		mocksBehaviour func(
			wMock *mocks.WishRepository,
			wlMock *mocks.WishlistRepository,
			wsService *mocks2.WSService,
		)
		args    args
		want    *model.Wish
		wantErr bool
	}{
		{
			name: "OK",
			mocksBehaviour: func(
				wMock *mocks.WishRepository,
				wlMock *mocks.WishlistRepository,
				wsService *mocks2.WSService,
			) {
				wMock.On("Get", "0000").
					Return(
						&model.Wish{
							UserId:       10,
							WishlistUuid: "0001",
							FulfilledAt:  model.NullTime{NullTime: sql.NullTime{Valid: true, Time: time.Now()}},
							PresenterId:  model.NullInt64{NullInt64: sql.NullInt64{Valid: true, Int64: 20}},
						},
						nil,
					)
				wlMock.On("GetByUUID", "0001").
					Return(
						&model.Wishlist{
							UserId:   10,
							Uuid:     "0001",
							Visible:  model.Public,
							IsActive: true,
						},
						nil,
					)
				wlMock.On("GetByUUID", "0002").
					Return(
						&model.Wishlist{
							UserId:  1,
							Uuid:    "0002",
							Visible: model.Public,
						},
						nil,
					)

				wMock.On("Create",
					&model.Wish{
						UserId:       1,
						WishlistUuid: "0002",
					}).
					Return(&model.Wish{WishlistUuid: "0002", UserId: 1}, nil)

				wsService.On(
					"SendMessageToChannel",
					"wishlist_0002",
					model.WSMessage{Event: service.Update},
				).
					Return(nil)
			},
			args: args{userId: 1, wishUuid: "0000", toWishlistUuid: "0002"},
			want: &model.Wish{WishlistUuid: "0002", UserId: 1, Actions: model.WishActions{Edit: true, MakeFull: true}},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			wishRepository := mocks.NewWishRepository(t)
			wishlistRepository := mocks.NewWishlistRepository(t)
			wsService := mocks2.NewWSService(t)
			tt.mocksBehaviour(wishRepository, wishlistRepository, wsService)

			s := &WishlistImpl{
				WishlistRepository: wishlistRepository,
				WishRepository:     wishRepository,
				UserService:        mocks2.NewUserService(t),
				FriendService:      mocks2.NewFriendService(t),
				WSService:          wsService,
			}
			got, err := s.CopyWish(tt.args.userId, tt.args.wishUuid, tt.args.toWishlistUuid)
			if (err != nil) != tt.wantErr {
				t.Errorf("CopyWish() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("CopyWish() got = %v, want %v", got, tt.want)
			}
		})
	}
}
