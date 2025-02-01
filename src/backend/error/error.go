package error

import "fmt"

func NewError(Code int, Message string) *Error {
	return &Error{Code: Code, Message: Message}
}

func NewErrorWithData(Code int, Message string, Details string) *Error {
	return &Error{Code, Message, Details}
}

type Error struct {
	Code    int
	Message string
	Details string
}

func (e *Error) Error() string {
	return fmt.Sprintf("%d: %s", e.Code, e.Message)
}
