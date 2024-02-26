package error

import "fmt"

func NewError(Code int, Message string) *Error {
	return &Error{Code, Message}
}

type Error struct {
	Code    int
	Message string
}

func (e *Error) Error() string {
	return fmt.Sprintf("%d: %s", e.Code, e.Message)
}
