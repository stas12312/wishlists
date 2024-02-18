package model

import (
	"github.com/dchest/uniuri"
	"github.com/google/uuid"
	"math/rand"
	"strconv"
	"strings"
)

const (
	ConfirmEmailCode  = 1
	ResetPasswordCode = 2
)

type Code struct {
	UUID      string `json:"uuid"`
	Code      string `redis:"code" json:"code"`
	Key       string `redis:"key" json:"key"`
	SecretKey string `redis:"secret_key" json:"secret_key"`
	UserId    int64  `redis:"user_id" json:"user_id"`
	CodeType  int    `redis:"code_type" json:"-"`
}

func NewCode(
	userId int64,
	codeLength int,
	keyLength int,
	codeType int,
) *Code {
	numbers := make([]string, codeLength)
	for i := 0; i < codeLength; i++ {
		numbers = append(numbers, strconv.Itoa(rand.Intn(10)))
	}
	codeUUID := uuid.NewString()

	return &Code{
		UUID:      codeUUID,
		Code:      strings.Join(numbers, ""),
		Key:       uniuri.NewLen(keyLength),
		SecretKey: uniuri.NewLen(keyLength),
		UserId:    userId,
		CodeType:  codeType,
	}
}
