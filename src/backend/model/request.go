package model

type Response struct {
	Data interface{} `json:"data"`
}

type ResponseWithMessage struct {
	Message string `json:"message"`
}

type ErrorResponse struct {
	Message string `json:"message"`
	Details string `json:"details"`
}

type ErrorField struct {
	Name string `json:"name"`
	Tag  string `json:"tag"`
}

type ValidateErrorResponse struct {
	Message string       `json:"message"`
	Details string       `json:"details"`
	Fields  []ErrorField `json:"fields"`
}
