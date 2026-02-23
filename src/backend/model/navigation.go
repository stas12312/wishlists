package model

type Navigation struct {
	Cursor []string `query:"cursor" json:"cursor"`
	Count  int      `query:"count" json:"count"`
}
