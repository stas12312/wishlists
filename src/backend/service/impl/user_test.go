package impl

import (
	"errors"
	"github.com/stretchr/testify/mock"
	"main/model"
	"main/repository/mocks"
	"reflect"
	"strings"
	"testing"
)

func TestNewUserService(t *testing.T) {
	tests := []struct {
		name string
	}{
		{
			name: "OK",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userRepository := mocks.NewUserRepository(t)
			if got := NewUserService(userRepository); !reflect.DeepEqual(got, NewUserService(userRepository)) {
				t.Errorf("NewUserService() = %v, want %v", got, NewUserService(userRepository))
			}
		})
	}
}

func Test_checkPasswordHash(t *testing.T) {
	type args struct {
		password string
		hash     string
	}
	tests := []struct {
		name string
		args args
		want bool
	}{
		{
			name: "Correct password",
			args: args{
				password: "123",
				hash:     "$2a$10$8AfbB/QfpANxZ6HwU/Lg8e.aVtOSayQU2wwhOOTTCPxZuK0lJ4szu",
			},
			want: true,
		},
		{
			name: "Incorrect password",
			args: args{
				password: "123",
				hash:     "$2a$12$yafL5nYjnyJku7EpwfOU2esxR3GofXea26cKemiYlnuN1h.jeIg06",
			},
			want: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := checkPasswordHash(tt.args.password, tt.args.hash); got != tt.want {
				t.Errorf("checkPasswordHash() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_hashPassword(t *testing.T) {
	type args struct {
		password string
	}
	tests := []struct {
		name    string
		args    args
		want    string
		wantErr bool
	}{
		{
			name: "Too long password",
			args: args{
				strings.Repeat("1", 100),
			},
			want:    "",
			wantErr: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := hashPassword(tt.args.password)
			if (err != nil) != tt.wantErr {
				t.Errorf("hashPassword() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("hashPassword() got = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_userServiceImpl_GetByEmail(t *testing.T) {
	type args struct {
		email string
	}
	tests := []struct {
		name    string
		args    args
		want    *model.User
		wantErr bool
	}{
		{
			name: "OK Create",
			args: args{email: "test@email.ru"},
			want: &model.User{
				Id:    1,
				Email: "test@email.ru",
				Name:  "name",
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userRepository := mocks.NewUserRepository(t)

			userRepository.
				On("GetByEmail", tt.args.email).
				Once().
				Return(&model.User{Id: 1, Email: tt.args.email, Name: "name"}, nil)

			u := &userServiceImpl{
				UserRepository: userRepository,
			}
			got, err := u.GetByEmail(tt.args.email)
			if (err != nil) != tt.wantErr {
				t.Errorf("GetByEmail() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("GetByEmail() got = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_userServiceImpl_GetById(t *testing.T) {
	type args struct {
		id int64
	}
	tests := []struct {
		name    string
		args    args
		want    *model.User
		wantErr bool
	}{
		{
			name: "OK",
			args: args{
				id: 1,
			},
			want: &model.User{
				Id:   1,
				Name: "name",
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			userRepository := mocks.NewUserRepository(t)

			userRepository.
				On("GetById", tt.args.id).
				Once().
				Return(&model.User{Id: tt.args.id, Name: "name"}, nil)

			u := &userServiceImpl{
				userRepository,
			}
			got, err := u.GetById(tt.args.id)
			if (err != nil) != tt.wantErr {
				t.Errorf("GetById() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("GetById() got = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_userServiceImpl_Login(t *testing.T) {
	type args struct {
		email    string
		password string
	}
	tests := []struct {
		name            string
		user            *model.User
		repositoryError error
		args            args
		want            *model.User
		wantErr         bool
	}{
		{
			name: "OK",
			args: args{
				email:    "email@email.ru",
				password: "123",
			},
			user: &model.User{
				Id:       1,
				Email:    "email@email.ru",
				Password: "$2a$10$UxuSs7PkUlfEX68FbyMdPuc.B7r54KIwKva0mRIPacr2vTVLMHYrm",
			},
			want: &model.User{
				Id:       1,
				Email:    "email@email.ru",
				Password: "$2a$10$UxuSs7PkUlfEX68FbyMdPuc.B7r54KIwKva0mRIPacr2vTVLMHYrm",
			},
			wantErr: false,
		},
		{
			name: "User not exist",
			args: args{
				email:    "not@email.ru",
				password: "123",
			},
			user:            nil,
			want:            nil,
			wantErr:         true,
			repositoryError: errors.New("error"),
		},
		{
			name: "Incorrect password",
			args: args{
				email:    "email@email.ru",
				password: "1234",
			},
			user: &model.User{
				Id:       1,
				Email:    "email@email.ru",
				Password: "$2a$10$UxuSs7PkUlfEX68FbyMdPuc.B7r54KIwKva0mRIPacr2vTVLMHYrm",
			},
			want:    nil,
			wantErr: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userRepository := mocks.NewUserRepository(t)

			userRepository.
				On("GetByEmail", tt.args.email).
				Once().
				Return(tt.user, tt.repositoryError)

			u := &userServiceImpl{
				UserRepository: userRepository,
			}
			got, err := u.Login(tt.args.email, tt.args.password)
			if (err != nil) != tt.wantErr {
				t.Errorf("Login() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("Login() got = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_userServiceImpl_Register(t *testing.T) {

	type args struct {
		email    string
		password string
		name     string
	}
	tests := []struct {
		name    string
		args    args
		want    *model.User
		wantErr bool
	}{
		{
			name: "OK",
			args: args{
				email:    "email",
				password: "password",
				name:     "name",
			},
			want: &model.User{
				Name:  "name",
				Email: "email",
				Id:    1,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			userRepository := mocks.NewUserRepository(t)

			userRepository.On("Create", tt.args.email, mock.AnythingOfType("string"), tt.args.name).
				Once().
				Return(tt.want, nil)

			u := &userServiceImpl{
				UserRepository: userRepository,
			}
			got, err := u.Register(tt.args.email, tt.args.password, tt.args.name)
			if (err != nil) != tt.wantErr {
				t.Errorf("Register() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("Register() got = %v, want %v", got, tt.want)
			}
		})
	}
}
