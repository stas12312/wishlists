package impl

import (
	"github.com/redis/go-redis/v9"
	"golang.org/x/net/context"
	"main/model"
	"time"
)

func NewConfirmCodeRedis(
	client *redis.Client,
	codeTTL time.Duration,
) *ConfirmCodeRedis {
	return &ConfirmCodeRedis{client, codeTTL}
}

type ConfirmCodeRedis struct {
	redisClient *redis.Client
	codeTTL     time.Duration
}

func (c ConfirmCodeRedis) Create(code *model.ConfirmCode) (*model.ConfirmCode, error) {
	result := c.redisClient.HSet(context.Background(), code.UUID, code)

	c.redisClient.Expire(context.Background(), code.UUID, c.codeTTL)

	return code, result.Err()

}

func (c ConfirmCodeRedis) GetByUUID(uuid string) (*model.ConfirmCode, error) {

	result := c.redisClient.HGetAll(context.Background(), uuid)
	if result.Err() != nil {
		return nil, result.Err()
	}
	confirmCode := &model.ConfirmCode{}
	err := result.Scan(confirmCode)
	return confirmCode, err
}

func (c ConfirmCodeRedis) DeleteByUUID(uuid string) error {
	result := c.redisClient.Del(context.Background(), uuid)
	return result.Err()
}
