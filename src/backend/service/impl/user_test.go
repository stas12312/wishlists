package impl

import (
	"errors"
	"github.com/stretchr/testify/mock"
	"main/config"
	mocks2 "main/mail/mocks"
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
			mailClient := mocks2.NewClient(t)
			confirmCodeRepository := mocks.NewConfirmCodeRepository(t)
			newConfig := &config.Config{}
			NewUserService(userRepository, confirmCodeRepository, mailClient, newConfig)

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
			confirmCodeRepository := mocks.NewConfirmCodeRepository(t)

			userRepository.
				On("GetByEmail", tt.args.email).
				Once().
				Return(&model.User{Id: 1, Email: tt.args.email, Name: "name"}, nil)

			u := &userServiceImpl{
				UserRepository:        userRepository,
				ConfirmCodeRepository: confirmCodeRepository,
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
			confirmCodeRepository := mocks.NewConfirmCodeRepository(t)

			userRepository.
				On("GetById", tt.args.id).
				Once().
				Return(&model.User{Id: tt.args.id, Name: "name"}, nil)

			u := &userServiceImpl{
				UserRepository:        userRepository,
				ConfirmCodeRepository: confirmCodeRepository,
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
				IsActive: true,
			},
			want: &model.User{
				Id:       1,
				Email:    "email@email.ru",
				Password: "$2a$10$UxuSs7PkUlfEX68FbyMdPuc.B7r54KIwKva0mRIPacr2vTVLMHYrm",
				IsActive: true,
			},
			wantErr: false,
		},
		{
			name: "Email isn't activated",
			args: args{
				email:    "email@email.ru",
				password: "123",
			},
			user: &model.User{
				Id:       1,
				Email:    "email@email.ru",
				Password: "$2a$10$UxuSs7PkUlfEX68FbyMdPuc.B7r54KIwKva0mRIPacr2vTVLMHYrm",
				IsActive: false,
			},
			wantErr: true,
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
		name          string
		args          args
		wantUser      *model.User
		wantErr       bool
		codeExists    bool
		mockBehaviour func(
			userRepository *mocks.UserRepository,
			confirmCodeRepository *mocks.ConfirmCodeRepository,
		)
		sendEmail bool
		mailError error
	}{
		{
			name: "OK",
			args: args{
				email:    "email",
				password: "password",
				name:     "name",
			},
			wantUser: &model.User{
				Name:  "name",
				Email: "email",
				Id:    1,
			},
			codeExists: true,
			mockBehaviour: func(userRepository *mocks.UserRepository, confirmCodeRepository *mocks.ConfirmCodeRepository) {
				userRepository.
					On("GetByEmail", "email").
					Once().
					Return(&model.User{}, nil)

				userRepository.On("Create", "email", mock.AnythingOfType("string"), "name").
					Once().
					Return(&model.User{Name: "name", Email: "email", Id: 1}, nil)

				confirmCodeRepository.
					On("Create", mock.AnythingOfType("*model.ConfirmCode")).
					Once().
					Return(&model.ConfirmCode{Code: "123456"}, nil)
			},
			sendEmail: true,
		},
		{
			name: "User already register",
			args: args{
				email:    "email",
				password: "password",
				name:     "name",
			},
			wantUser:   nil,
			codeExists: false,
			mockBehaviour: func(userRepository *mocks.UserRepository, confirmCodeRepository *mocks.ConfirmCodeRepository) {
				userRepository.
					On("GetByEmail", "email").
					Once().
					Return(&model.User{Id: 1, IsActive: true}, nil)
			},
			sendEmail: false,
			wantErr:   true,
		},
		{
			name: "Error in create user",
			args: args{
				email:    "email",
				password: "password",
				name:     "name",
			},
			wantUser:   nil,
			codeExists: false,
			wantErr:    true,
			sendEmail:  false,
			mockBehaviour: func(userRepository *mocks.UserRepository, confirmCodeRepository *mocks.ConfirmCodeRepository) {
				userRepository.
					On("GetByEmail", "email").
					Once().
					Return(&model.User{}, nil)

				userRepository.On("Create", "email", mock.AnythingOfType("string"), "name").
					Once().
					Return(&model.User{}, errors.New("error"))
			},
		},
		{
			name: "Error in create code",
			args: args{
				email:    "email",
				password: "password",
				name:     "name",
			},
			wantUser:   nil,
			codeExists: false,
			wantErr:    true,
			sendEmail:  false,
			mockBehaviour: func(userRepository *mocks.UserRepository, confirmCodeRepository *mocks.ConfirmCodeRepository) {
				userRepository.
					On("GetByEmail", "email").
					Once().
					Return(&model.User{}, nil)

				userRepository.On("Create", "email", mock.AnythingOfType("string"), "name").
					Once().
					Return(&model.User{}, nil)

				confirmCodeRepository.
					On("Create", mock.AnythingOfType("*model.ConfirmCode")).
					Once().
					Return(nil, errors.New("error"))
			},
		},
		{
			name: "Error in send email",
			args: args{
				email:    "email",
				password: "password",
				name:     "name",
			},
			wantUser:   nil,
			codeExists: false,
			wantErr:    true,
			sendEmail:  true,
			mockBehaviour: func(userRepository *mocks.UserRepository, confirmCodeRepository *mocks.ConfirmCodeRepository) {
				userRepository.
					On("GetByEmail", "email").
					Once().
					Return(&model.User{}, nil)

				userRepository.On("Create", "email", mock.AnythingOfType("string"), "name").
					Once().
					Return(&model.User{}, nil)

				confirmCodeRepository.
					On("Create", mock.AnythingOfType("*model.ConfirmCode")).
					Once().
					Return(&model.ConfirmCode{Code: "123123"}, nil)
			},
			mailError: errors.New("error"),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			userRepository := mocks.NewUserRepository(t)
			confirmCodeRepository := mocks.NewConfirmCodeRepository(t)
			mailClient := mocks2.NewClient(t)
			appConfig := &config.Config{BaseUrl: "http://test"}

			if tt.sendEmail {
				mailClient.
					On(
						"Send", []string{tt.args.email},
						"Подтвердите ваш e-mail",
						mock.AnythingOfType("string"),
					).
					Return(tt.mailError)
			}

			tt.mockBehaviour(userRepository, confirmCodeRepository)

			u := &userServiceImpl{
				UserRepository:        userRepository,
				ConfirmCodeRepository: confirmCodeRepository,
				Client:                mailClient,
				Config:                appConfig,
			}
			gotUser, gotCode, err := u.Register(tt.args.email, tt.args.password, tt.args.name)
			if (err != nil) != tt.wantErr {
				t.Errorf("Register() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if tt.codeExists && gotCode.UUID == "" {
				t.Errorf("Not code")
				return
			}
			if !reflect.DeepEqual(gotUser, tt.wantUser) {
				t.Errorf("Register() got = %v, want %v", gotUser, tt.wantUser)
			}
		})
	}
}

func Test_userServiceImpl_Confirm(t *testing.T) {
	type args struct {
		code *model.ConfirmCode
	}
	tests := []struct {
		name          string
		mockBehaviour func(userRepository *mocks.UserRepository, confirmCodeRespository *mocks.ConfirmCodeRepository)
		args          args
		want          *model.User
		AutoLogin     bool
		wantErr       bool
	}{
		{
			name: "OK by Code",
			args: args{
				&model.ConfirmCode{UUID: "uuid", Code: "123", SecretKey: "key"},
			},
			want:      &model.User{Id: 1, IsActive: true},
			AutoLogin: true,
			mockBehaviour: func(
				userRepository *mocks.UserRepository,
				confirmCodeRepository *mocks.ConfirmCodeRepository,
			) {
				confirmCodeRepository.
					On("GetByUUID", "uuid").
					Once().
					Return(&model.ConfirmCode{UUID: "uuid", Code: "123", SecretKey: "key", UserId: 1}, nil)

				confirmCodeRepository.
					On("DeleteByUUID", "uuid").
					Once().
					Return(nil)

				userRepository.
					On("GetById", int64(1)).
					Once().
					Return(&model.User{Id: 1, IsActive: false}, nil)
				userRepository.
					On("Update", &model.User{Id: 1, IsActive: true}).
					Once().
					Return(&model.User{Id: 1, IsActive: true}, nil)

			},
		},
		{
			name: "OK by Key",
			args: args{
				&model.ConfirmCode{UUID: "uuid", Code: "123", Key: "urlkey", SecretKey: "wrong_key"},
			},
			want:      &model.User{Id: 1, IsActive: true},
			AutoLogin: false,
			mockBehaviour: func(
				userRepository *mocks.UserRepository,
				confirmCodeRepository *mocks.ConfirmCodeRepository,
			) {
				confirmCodeRepository.
					On("GetByUUID", "uuid").
					Once().
					Return(&model.ConfirmCode{
						UUID:      "uuid",
						Code:      "123",
						SecretKey: "key",
						Key:       "urlkey",
						UserId:    1,
					}, nil)

				confirmCodeRepository.
					On("DeleteByUUID", "uuid").
					Once().
					Return(nil)

				userRepository.
					On("GetById", int64(1)).
					Once().
					Return(&model.User{Id: 1, IsActive: false}, nil)
				userRepository.
					On("Update", &model.User{Id: 1, IsActive: true}).
					Once().
					Return(&model.User{Id: 1, IsActive: true}, nil)

			},
		},
		{
			name: "Wrong key",
			args: args{
				&model.ConfirmCode{UUID: "uuid", Code: "123", Key: "wrong_key", SecretKey: "wrong_key"},
			},
			want:      nil,
			wantErr:   true,
			AutoLogin: false,
			mockBehaviour: func(
				userRepository *mocks.UserRepository,
				confirmCodeRepository *mocks.ConfirmCodeRepository,
			) {
				confirmCodeRepository.
					On("GetByUUID", "uuid").
					Once().
					Return(&model.ConfirmCode{
						UUID:      "uuid",
						Code:      "123",
						SecretKey: "key",
						Key:       "urlkey",
						UserId:    1,
					}, nil)
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			userRepository := mocks.NewUserRepository(t)
			confirmCodeRepository := mocks.NewConfirmCodeRepository(t)
			mailClient := mocks2.NewClient(t)

			tt.mockBehaviour(userRepository, confirmCodeRepository)

			u := &userServiceImpl{
				UserRepository:        userRepository,
				ConfirmCodeRepository: confirmCodeRepository,
				Client:                mailClient,
			}
			got, got1, err := u.Confirm(tt.args.code)
			if (err != nil) != tt.wantErr {
				t.Errorf("Confirm() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("Confirm() got = %v, want %v", got, tt.want)
			}
			if got1 != tt.AutoLogin {
				t.Errorf("Confirm() got1 = %v, want %v", got1, tt.AutoLogin)
			}
		})
	}
}

func Test_getMailMessage(t *testing.T) {
	type args struct {
		code    *model.ConfirmCode
		baseUrl string
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{
			name: "OK",
			args: args{
				code: &model.ConfirmCode{
					Code: "123",
					UUID: "uuid",
					Key:  "key",
				},
				baseUrl: "http://test.ru",
			},
			want: "Ваш код подтверждения: 123\nСсылка для подтверждения: http://test.ru/auth/confirm?uuid=uuid&key=key",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getMailMessage(tt.args.code, tt.args.baseUrl); got != tt.want {
				t.Errorf("getMailMessage() = %v, want %v", got, tt.want)
			}
		})
	}
}
