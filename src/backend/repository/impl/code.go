package impl

import (
	"errors"
	"github.com/redis/go-redis/v9"
	"golang.org/x/net/context"
	"main/model"
	"time"
)

func NewConfirmCodeRedis(
	client *redis.Client,
	codeTTL time.Duration,
) *CodeRedis {
	return &CodeRedis{client, codeTTL}
}

type CodeRedis struct {
	redisClient *redis.Client
	codeTTL     time.Duration
}

func (c CodeRedis) Create(code *model.Code) (*model.Code, error) {
	result := c.redisClient.HSet(context.Background(), code.UUID, code)

	c.redisClient.Expire(context.Background(), code.UUID, c.codeTTL)

	return code, result.Err()

}

func (c CodeRedis) Get(uuid string) (*model.Code, error) {

	code := &model.Code{}

	result := c.redisClient.HGetAll(context.Background(), uuid)
	if result.Err() != nil {
		return code, result.Err()
	}
	if len(result.Val()) == 0 {
		return code, errors.New("code not found")
	}

	err := result.Scan(code)
	code.UUID = uuid

	return code, err
}

func (c CodeRedis) DeleteByUUID(uuid string) error {
	result := c.redisClient.Del(context.Background(), uuid)
	return result.Err()
}

func (c CodeRedis) Consume(code *model.Code) (bool, error) {
	// Проверка и удаление атомарны: параллельный запрос не сможет выдать вторую сессию.
	result, err := c.redisClient.Eval(context.Background(), `
if redis.call('HGET', KEYS[1], 'key') == ARGV[1]
and redis.call('HGET', KEYS[1], 'code_type') == ARGV[2] then
    return redis.call('DEL', KEYS[1])
end
return 0`, []string{code.UUID}, code.Key, code.CodeType).Int()
	return result == 1, err
}

func (c CodeRedis) Update(code *model.Code) error {
	result := c.redisClient.HSet(context.Background(), code.UUID, code)
	return result.Err()
}

func (c CodeRedis) SaveEmailCountDown(email string, duration time.Duration) error {
	result := c.redisClient.Set(context.Background(), email, email, duration)
	return result.Err()
}

func (c CodeRedis) GetEmailCountDown(email string) (time.Duration, error) {
	return c.redisClient.TTL(context.Background(), email).Result()
}
