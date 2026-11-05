package mocks

import "main/model"

func (m *CodeRepository) Consume(code *model.Code) (bool, error) {
	result := m.Called(code)
	return result.Bool(0), result.Error(1)
}
