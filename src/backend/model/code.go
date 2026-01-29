package model

import (
	"math/rand"
	"strconv"
	"strings"

	"github.com/dchest/uniuri"
	"github.com/google/uuid"
)

const (
	ConfirmEmailCode  = 1
	ResetPasswordCode = 2
)

type Code struct {
	UUID          string `json:"uuid"`
	Code          string `redis:"code" json:"code"`
	Key           string `redis:"key" json:"key"`
	SecretKey     string `redis:"secret_key" json:"secret_key"`
	UserId        int64  `redis:"user_id" json:"user_id"`
	CodeType      int    `redis:"code_type" json:"-"`
	AttemptsCount int    `redis:"attempt_count" json:"-"`
}

type ShortCode struct {
	UUID      string `json:"uuid"`
	SecretKey string `redis:"secret_key" json:"secret_key"`
}

func NewCode(
	userId int64,
	codeLength int,
	keyLength int,
	codeType int,
	attemptsCount int,
) *Code {
	numbers := make([]string, codeLength)
	for i := 0; i < codeLength; i++ {
		numbers = append(numbers, strconv.Itoa(rand.Intn(10)))
	}
	codeUUID := uuid.NewString()

	return &Code{
		UUID:          codeUUID,
		Code:          strings.Join(numbers, ""),
		Key:           uniuri.NewLen(keyLength),
		SecretKey:     uniuri.NewLen(keyLength),
		UserId:        userId,
		CodeType:      codeType,
		AttemptsCount: attemptsCount,
	}
}

func NewTestCode(
	userId int64,
	email string,
	codeType int,
	attemptsCount int,
) *Code {
	codeValue := strings.TrimRight(email, "@test.mywishlists.ru")
	return &Code{
		UUID:          uuid.NewString(),
		Code:          codeValue,
		Key:           email,
		SecretKey:     email,
		UserId:        userId,
		CodeType:      codeType,
		AttemptsCount: attemptsCount,
	}
}
