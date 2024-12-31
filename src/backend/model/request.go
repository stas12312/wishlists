package model

type Response struct {
	Data       interface{} `json:"data"`
	Navigation Navigation  `json:"navigation"`
}

type ResponseWithMessage struct {
	Message string `json:"message"`
}

type ErrorResponse struct {
	Message string `json:"message"`
	Details string `json:"details"`
	Code    int    `json:"code"`
}

type ErrorField struct {
	Name    string `json:"name"`
	Tag     string `json:"tag"`
	Message string `json:"message"`
}

type ValidateErrorResponse struct {
	Message string       `json:"message"`
	Details string       `json:"details"`
	Fields  []ErrorField `json:"fields"`
}
