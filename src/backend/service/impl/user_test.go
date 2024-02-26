package impl

import (
	"context"
	"errors"
	"github.com/stretchr/testify/mock"
	"main/config"
	"main/db"
	mocks3 "main/db/mocks"
	mocks2 "main/mail/mocks"
	"main/model"
	"main/repository/mocks"
	"main/uof"
	"main/uof/impl"
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

			unitOfWork := impl.NewUnitOfWorkPostgres(
				mocks3.DB{},
				func(connection db.Connection) uof.UnitOfWorkStore {
					return impl.NewUofStore(
						mocks.NewUserRepository(t),
						mocks.NewWishlistRepository(t),
						mocks.NewWishRepository(t),
					)
				},
			)

			mailClient := mocks2.NewClient(t)
			confirmCodeRepository := mocks.NewCodeRepository(t)
			newConfig := &config.Config{}
			NewUserService(unitOfWork, confirmCodeRepository, mailClient, newConfig)

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
			codeRepository := mocks.NewCodeRepository(t)

			userRepository.
				On("GetByEmail", tt.args.email).
				Once().
				Return(&model.User{Id: 1, Email: tt.args.email, Name: "name"}, nil)

			unitOfWork := impl.NewUnitOfWorkPostgres(
				mocks3.DB{},
				func(connection db.Connection) uof.UnitOfWorkStore {
					return impl.NewUofStore(
						userRepository,
						mocks.NewWishlistRepository(t),
						mocks.NewWishRepository(t),
					)
				},
			)

			u := &userServiceImpl{
				UnitOfWork:     unitOfWork,
				CodeRepository: codeRepository,
			}
			got, err := u.GetByEmail(context.Background(), tt.args.email)
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
			codeRepository := mocks.NewCodeRepository(t)

			userRepository.
				On("GetById", tt.args.id).
				Once().
				Return(&model.User{Id: tt.args.id, Name: "name"}, nil)

			unitOfWork := impl.NewUnitOfWorkPostgres(
				mocks3.DB{},
				func(connection db.Connection) uof.UnitOfWorkStore {
					return impl.NewUofStore(
						userRepository,
						mocks.NewWishlistRepository(t),
						mocks.NewWishRepository(t),
					)
				},
			)

			u := &userServiceImpl{
				UnitOfWork:     unitOfWork,
				CodeRepository: codeRepository,
			}
			got, err := u.GetById(context.Background(), tt.args.id)
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
			want:    &model.User{},
		},
		{
			name: "User not exist",
			args: args{
				email:    "not@email.ru",
				password: "123",
			},
			user:            nil,
			want:            &model.User{},
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
			want:    &model.User{},
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

			unitOfWork := impl.NewUnitOfWorkPostgres(
				mocks3.DB{},
				func(connection db.Connection) uof.UnitOfWorkStore {
					return impl.NewUofStore(
						userRepository,
						mocks.NewWishlistRepository(t),
						mocks.NewWishRepository(t),
					)
				},
			)
			u := &userServiceImpl{
				UnitOfWork: unitOfWork,
			}
			got, err := u.Login(context.Background(), tt.args.email, tt.args.password)
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
			confirmCodeRepository *mocks.CodeRepository,
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
			mockBehaviour: func(userRepository *mocks.UserRepository, confirmCodeRepository *mocks.CodeRepository) {
				userRepository.
					On("GetByEmail", "email").
					Once().
					Return(&model.User{}, nil)

				userRepository.On("Create", "email", mock.AnythingOfType("string"), "name").
					Once().
					Return(&model.User{Name: "name", Email: "email", Id: 1}, nil)

				confirmCodeRepository.
					On("Create", mock.AnythingOfType("*model.Code")).
					Once().
					Return(&model.Code{Code: "123456"}, nil)
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
			wantUser:   &model.User{},
			codeExists: false,
			mockBehaviour: func(userRepository *mocks.UserRepository, confirmCodeRepository *mocks.CodeRepository) {
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
			wantUser:   &model.User{},
			codeExists: false,
			wantErr:    true,
			sendEmail:  false,
			mockBehaviour: func(userRepository *mocks.UserRepository, confirmCodeRepository *mocks.CodeRepository) {
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
			wantUser:   &model.User{},
			codeExists: false,
			wantErr:    true,
			sendEmail:  false,
			mockBehaviour: func(userRepository *mocks.UserRepository, confirmCodeRepository *mocks.CodeRepository) {
				userRepository.
					On("GetByEmail", "email").
					Once().
					Return(&model.User{}, nil)

				userRepository.On("Create", "email", mock.AnythingOfType("string"), "name").
					Once().
					Return(&model.User{}, nil)

				confirmCodeRepository.
					On("Create", mock.AnythingOfType("*model.Code")).
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
			wantUser:   &model.User{},
			codeExists: false,
			wantErr:    true,
			sendEmail:  true,
			mockBehaviour: func(userRepository *mocks.UserRepository, confirmCodeRepository *mocks.CodeRepository) {
				userRepository.
					On("GetByEmail", "email").
					Once().
					Return(&model.User{}, nil)

				userRepository.On("Create", "email", mock.AnythingOfType("string"), "name").
					Once().
					Return(&model.User{}, nil)

				confirmCodeRepository.
					On("Create", mock.AnythingOfType("*model.Code")).
					Once().
					Return(&model.Code{Code: "123123"}, nil)
			},
			mailError: errors.New("error"),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			userRepository := mocks.NewUserRepository(t)
			codeRepository := mocks.NewCodeRepository(t)
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

			tt.mockBehaviour(userRepository, codeRepository)

			unitOfWork := impl.NewUnitOfWorkPostgres(
				mocks3.DB{},
				func(connection db.Connection) uof.UnitOfWorkStore {
					return impl.NewUofStore(
						userRepository,
						mocks.NewWishlistRepository(t),
						mocks.NewWishRepository(t),
					)
				},
			)

			u := &userServiceImpl{
				UnitOfWork:     unitOfWork,
				CodeRepository: codeRepository,
				MailClient:     mailClient,
				Config:         appConfig,
			}
			gotUser, gotCode, err := u.Register(context.Background(), tt.args.email, tt.args.password, tt.args.name)
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
		code *model.Code
	}
	tests := []struct {
		name          string
		mockBehaviour func(userRepository *mocks.UserRepository, codeRepository *mocks.CodeRepository)
		args          args
		want          *model.User
		AutoLogin     bool
		wantErr       bool
	}{
		{
			name: "OK by Code",
			args: args{
				&model.Code{UUID: "uuid", Code: "123", SecretKey: "key"},
			},
			want:      &model.User{Id: 1, IsActive: true},
			AutoLogin: true,
			mockBehaviour: func(
				userRepository *mocks.UserRepository,
				confirmCodeRepository *mocks.CodeRepository,
			) {
				confirmCodeRepository.
					On("Get", "uuid").
					Once().
					Return(&model.Code{
						UUID:          "uuid",
						Code:          "123",
						SecretKey:     "key",
						UserId:        1,
						CodeType:      model.ConfirmEmailCode,
						AttemptsCount: 3,
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
			name: "OK by Key",
			args: args{
				&model.Code{UUID: "uuid", Code: "123", Key: "urlkey", SecretKey: "wrong_key"},
			},
			want:      &model.User{Id: 1, IsActive: true},
			AutoLogin: false,
			mockBehaviour: func(
				userRepository *mocks.UserRepository,
				confirmCodeRepository *mocks.CodeRepository,
			) {
				confirmCodeRepository.
					On("Get", "uuid").
					Once().
					Return(&model.Code{
						UUID:          "uuid",
						Code:          "123",
						SecretKey:     "key",
						Key:           "urlkey",
						UserId:        1,
						CodeType:      model.ConfirmEmailCode,
						AttemptsCount: 3,
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
				&model.Code{UUID: "uuid", Code: "123", Key: "wrong_key", SecretKey: "wrong_key"},
			},
			want:      &model.User{},
			wantErr:   true,
			AutoLogin: false,
			mockBehaviour: func(
				userRepository *mocks.UserRepository,
				codeRepository *mocks.CodeRepository,
			) {
				code := &model.Code{
					UUID:          "uuid",
					Code:          "123",
					SecretKey:     "key",
					Key:           "urlkey",
					UserId:        1,
					AttemptsCount: 3,
				}
				codeRepository.
					On("Get", "uuid").
					Once().
					Return(code, nil)

				newCode := code
				newCode.AttemptsCount = 2

				codeRepository.
					On("Update", newCode).
					Once().
					Return(nil)
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			userRepository := mocks.NewUserRepository(t)
			codeRepository := mocks.NewCodeRepository(t)
			mailClient := mocks2.NewClient(t)

			tt.mockBehaviour(userRepository, codeRepository)

			unitOfWork := impl.NewUnitOfWorkPostgres(
				mocks3.DB{},
				func(connection db.Connection) uof.UnitOfWorkStore {
					return impl.NewUofStore(
						userRepository,
						mocks.NewWishlistRepository(t),
						mocks.NewWishRepository(t),
					)
				},
			)

			u := &userServiceImpl{
				UnitOfWork:     unitOfWork,
				CodeRepository: codeRepository,
				MailClient:     mailClient,
			}
			got, got1, err := u.Confirm(context.Background(), tt.args.code)
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

func Test_getConfirmEmailMessage(t *testing.T) {
	type args struct {
		code    *model.Code
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
				code: &model.Code{
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
			if got := getConfirmEmailMessage(tt.args.code, tt.args.baseUrl); got != tt.want {
				t.Errorf("getConfirmEmailMessage() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_getRestorePasswordMessage(t *testing.T) {
	type args struct {
		code    *model.Code
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
				code: &model.Code{
					Code: "123",
					UUID: "uuid",
					Key:  "key",
				},
				baseUrl: "http://test.ru",
			},
			want: "Код для сброса пароля: 123\n" +
				"Ссылка для сброса пароля: http://test.ru/auth/reset-password?uuid=uuid&key=key",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getRestorePasswordMessage(tt.args.code, tt.args.baseUrl); got != tt.want {
				t.Errorf("getConfirmEmailMessage() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_userServiceImpl_CheckCodeWithType(t *testing.T) {

	type args struct {
		code     *model.Code
		codeType int
	}
	tests := []struct {
		name         string
		args         args
		want         *model.Code
		mockBehavior func(mock *mocks.CodeRepository)
		want1        bool
	}{
		{
			name: "OK",
			args: args{
				code: &model.Code{
					UUID:      "uuid",
					Code:      "code",
					Key:       "key",
					SecretKey: "secret_key",
				},
				codeType: model.ConfirmEmailCode,
			},
			mockBehavior: func(mock *mocks.CodeRepository) {
				mock.
					On("Get", "uuid").
					Once().
					Return(
						&model.Code{
							UUID:          "uuid",
							Code:          "code",
							Key:           "key",
							SecretKey:     "secret_key",
							UserId:        1,
							CodeType:      model.ConfirmEmailCode,
							AttemptsCount: 3,
						},
						nil,
					)
			},
			want: &model.Code{
				UUID:          "uuid",
				Code:          "code",
				Key:           "key",
				SecretKey:     "secret_key",
				UserId:        1,
				CodeType:      model.ConfirmEmailCode,
				AttemptsCount: 3,
			},
			want1: true,
		},
		{
			name: "Wrong code type",
			args: args{
				code: &model.Code{
					UUID:      "uuid",
					Code:      "code",
					Key:       "key",
					SecretKey: "secret_key",
					UserId:    1,
				},
				codeType: model.ResetPasswordCode,
			},
			mockBehavior: func(mock *mocks.CodeRepository) {
				mock.
					On("Get", "uuid").
					Once().
					Return(
						&model.Code{
							UUID:          "uuid",
							Code:          "code",
							Key:           "key",
							SecretKey:     "secret_key",
							UserId:        1,
							CodeType:      model.ConfirmEmailCode,
							AttemptsCount: 3,
						},
						nil,
					)
			},
			want: &model.Code{
				UUID:          "uuid",
				Code:          "code",
				Key:           "key",
				SecretKey:     "secret_key",
				UserId:        1,
				CodeType:      model.ConfirmEmailCode,
				AttemptsCount: 3,
			},
			want1: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			userRepository := mocks.NewUserRepository(t)
			codeRepository := mocks.NewCodeRepository(t)

			unitOfWork := impl.NewUnitOfWorkPostgres(
				mocks3.DB{},
				func(connection db.Connection) uof.UnitOfWorkStore {
					return impl.NewUofStore(
						userRepository,
						mocks.NewWishlistRepository(t),
						mocks.NewWishRepository(t),
					)
				},
			)

			u := &userServiceImpl{
				UnitOfWork:     unitOfWork,
				CodeRepository: codeRepository,
			}

			tt.mockBehavior(codeRepository)

			got, got1 := u.CheckCodeWithType(context.Background(), tt.args.code, tt.args.codeType, true)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("CheckCodeWithType() got = %v, want %v", got, tt.want)
			}
			if got1 != tt.want1 {
				t.Errorf("CheckCodeWithType() got1 = %v, want %v", got1, tt.want1)
			}
		})
	}
}

func Test_userServiceImpl_Restore(t *testing.T) {

	type args struct {
		email string
	}
	tests := []struct {
		name           string
		args           args
		mockBehavior   func(codeMock *mocks.CodeRepository, userMock *mocks.UserRepository, mailMock *mocks2.Client)
		wantCodeUserId int64
		wantErr        bool
	}{
		{
			name: "OK",
			args: args{
				email: "email@mail.ru",
			},
			mockBehavior: func(codeMock *mocks.CodeRepository, userMock *mocks.UserRepository, mailMock *mocks2.Client) {
				codeMock.
					On("Create", mock.AnythingOfType("*model.Code")).
					Once().
					Return(&model.Code{UserId: 1}, nil)

				userMock.
					On("GetByEmail", "email@mail.ru").
					Once().
					Return(&model.User{Id: 1, IsActive: true, Email: "email@mail.ru"}, nil)
				mailMock.
					On(
						"Send", []string{"email@mail.ru"},
						"Восстановление пароля",
						mock.AnythingOfType("string"),
					).
					Once().
					Return(nil)
			},
			wantCodeUserId: 1,
		},
		{
			name: "User is not active",
			args: args{
				email: "email@mail.ru",
			},
			mockBehavior: func(codeMock *mocks.CodeRepository, userMock *mocks.UserRepository, mailMock *mocks2.Client) {
				userMock.
					On("GetByEmail", "email@mail.ru").
					Once().
					Return(&model.User{Id: 1, IsActive: false}, nil)
			},
			wantErr:        true,
			wantCodeUserId: 0,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			userRepository := mocks.NewUserRepository(t)
			codeRepository := mocks.NewCodeRepository(t)
			mailClient := mocks2.NewClient(t)

			unitOfWork := impl.NewUnitOfWorkPostgres(
				mocks3.DB{},
				func(connection db.Connection) uof.UnitOfWorkStore {
					return impl.NewUofStore(
						userRepository,
						mocks.NewWishlistRepository(t),
						mocks.NewWishRepository(t),
					)
				},
			)

			u := &userServiceImpl{
				UnitOfWork:     unitOfWork,
				CodeRepository: codeRepository,
				MailClient:     mailClient,
				Config:         &config.Config{BaseUrl: "https://test.ru"},
			}

			tt.mockBehavior(codeRepository, userRepository, mailClient)
			got, err := u.Restore(context.Background(), tt.args.email)
			if (err != nil) != tt.wantErr {
				t.Errorf("Restore() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !(got.UserId == tt.wantCodeUserId) {
				t.Errorf("Restore() got = %v, want %v", got.UserId, tt.wantCodeUserId)
			}
		})
	}
}

func Test_userServiceImpl_Reset(t *testing.T) {
	type args struct {
		code     *model.Code
		password *model.ResetPassword
	}

	type test struct {
		name         string
		args         args
		want         *model.User
		mockBehavior func(codeMock *mocks.CodeRepository, userMock *mocks.UserRepository, tt *test)
		wantErr      bool
	}

	tests := []test{
		{
			name: "OK",
			args: args{
				code:     &model.Code{UUID: "uuid", Key: "key"},
				password: &model.ResetPassword{Password: "newPassword"},
			},

			mockBehavior: func(codeMock *mocks.CodeRepository, userMock *mocks.UserRepository, tt *test) {
				codeMock.
					On("Get", tt.args.code.UUID).
					Once().
					Return(&model.Code{
						UUID:          tt.args.code.UUID,
						Key:           "key",
						UserId:        1,
						CodeType:      model.ResetPasswordCode,
						AttemptsCount: 3,
					}, nil)

				userMock.
					On("UpdatePassword", int64(1), mock.AnythingOfType("string")).
					Once().
					Return(nil)

				codeMock.
					On("DeleteByUUID", tt.args.code.UUID).
					Once().
					Return(nil)

				userMock.
					On("GetById", int64(1)).
					Once().
					Return(&model.User{Id: 1}, nil)
			},
			want: &model.User{Id: 1},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			userRepository := mocks.NewUserRepository(t)
			codeRepository := mocks.NewCodeRepository(t)

			unitOfWork := impl.NewUnitOfWorkPostgres(
				mocks3.DB{},
				func(connection db.Connection) uof.UnitOfWorkStore {
					return impl.NewUofStore(
						userRepository,
						mocks.NewWishlistRepository(t),
						mocks.NewWishRepository(t),
					)
				},
			)

			u := &userServiceImpl{
				UnitOfWork:     unitOfWork,
				CodeRepository: codeRepository,
			}

			tt.mockBehavior(codeRepository, userRepository, &tt)
			got, err := u.Reset(context.Background(), tt.args.code, tt.args.password)
			if (err != nil) != tt.wantErr {
				t.Errorf("Reset() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("Reset() got = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_userServiceImpl_CheckCode(t *testing.T) {
	type args struct {
		code         *model.Code
		checkAttempt bool
	}
	tests := []struct {
		name          string
		args          args
		mockBehaviour func(codeMock *mocks.CodeRepository)
		want          *model.Code
		want1         bool
	}{
		{
			name: "ОК",
			args: args{
				code: &model.Code{
					UUID:      "uuid",
					Code:      "code",
					SecretKey: "secret_key",
				},
				checkAttempt: true,
			},

			mockBehaviour: func(codeMock *mocks.CodeRepository) {
				codeMock.
					On("Get", "uuid").
					Once().
					Return(&model.Code{
						UUID:          "uuid",
						Code:          "code",
						SecretKey:     "secret_key",
						UserId:        1,
						AttemptsCount: 1,
					},
						nil)
			},

			want:  &model.Code{UUID: "uuid", Code: "code", SecretKey: "secret_key", UserId: 1, AttemptsCount: 1},
			want1: true,
		},
		{
			name: "Wrong code",
			args: args{
				code: &model.Code{
					UUID:      "uuid",
					Code:      "wrong_code",
					SecretKey: "secret_key",
				},
				checkAttempt: true,
			},
			mockBehaviour: func(codeMock *mocks.CodeRepository) {
				code1 := model.Code{
					UUID:          "uuid",
					Code:          "code",
					SecretKey:     "secret_key",
					Key:           "key",
					UserId:        1,
					AttemptsCount: 2,
				}
				codeMock.
					On("Get", "uuid").
					Once().
					Return(&code1, nil)

				code2 := code1
				code2.AttemptsCount = 1

				codeMock.
					On("Update", &code2).
					Once().
					Return(nil)
			},
			want: &model.Code{
				UUID:          "uuid",
				Code:          "code",
				SecretKey:     "secret_key",
				Key:           "key",
				UserId:        1,
				AttemptsCount: 1,
			},
			want1: false,
		},
		{
			name: "Delete code",
			args: args{
				code: &model.Code{
					UUID:      "uuid",
					Code:      "wrong_code",
					SecretKey: "secret_key",
				},
				checkAttempt: true,
			},
			mockBehaviour: func(codeMock *mocks.CodeRepository) {
				code := &model.Code{
					UUID:          "uuid",
					Code:          "code",
					SecretKey:     "secret_key",
					Key:           "key",
					UserId:        1,
					AttemptsCount: 1,
				}
				codeMock.
					On("Get", "uuid").
					Once().
					Return(code, nil)

				codeMock.
					On("DeleteByUUID", "uuid").
					Once().
					Return(nil)
			},
			want: &model.Code{
				UUID:          "uuid",
				Code:          "code",
				SecretKey:     "secret_key",
				Key:           "key",
				UserId:        1,
				AttemptsCount: 0,
			},
			want1: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			codeRepository := mocks.NewCodeRepository(t)

			tt.mockBehaviour(codeRepository)

			unitOfWork := impl.NewUnitOfWorkPostgres(
				mocks3.DB{},
				func(connection db.Connection) uof.UnitOfWorkStore {
					return impl.NewUofStore(
						mocks.NewUserRepository(t),
						mocks.NewWishlistRepository(t),
						mocks.NewWishRepository(t),
					)
				},
			)
			u := &userServiceImpl{
				UnitOfWork:     unitOfWork,
				CodeRepository: codeRepository,
			}

			got, got1 := u.CheckCode(context.Background(), tt.args.code, tt.args.checkAttempt)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("CheckCode() got = %v, want %v", got, tt.want)
			}
			if got1 != tt.want1 {
				t.Errorf("CheckCode() got1 = %v, want %v", got1, tt.want1)
			}
		})
	}
}
