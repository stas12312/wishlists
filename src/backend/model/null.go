package model

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/lib/pq"
	"strconv"
	"strings"
	"time"
)

type NullTime struct {
	sql.NullTime
}

func (nt *NullTime) MarshalJSON() ([]byte, error) {
	if !nt.Valid {
		return []byte("null"), nil
	}
	val := fmt.Sprintf("\"%s\"", nt.Time.Format(time.RFC3339))
	return []byte(val), nil
}

func (nt *NullTime) UnmarshalJSON(b []byte) error {
	s := strings.ReplaceAll(string(b), "\"", "")

	if s == "null" {
		nt.Valid = false
		return nil
	}

	x, err := time.Parse(time.RFC3339, s)
	if err != nil {
		nt.Valid = false
		return err
	}

	nt.Time = x
	nt.Valid = true
	return nil
}

type NullDate struct {
	sql.NullTime
}

func (nt *NullDate) MarshalJSON() ([]byte, error) {
	if !nt.Valid {
		return []byte("null"), nil
	}
	val := fmt.Sprintf("\"%s\"", nt.Time.Format(time.DateOnly))
	return []byte(val), nil
}

func (nt *NullDate) UnmarshalJSON(b []byte) error {
	s := strings.ReplaceAll(string(b), "\"", "")

	if s == "null" {
		nt.Valid = false
		return nil
	}

	x, err := time.Parse(time.DateOnly, s)
	if err != nil {
		nt.Valid = false
		return err
	}

	nt.Time = x
	nt.Valid = true
	return nil
}

type NullString struct {
	sql.NullString
}

func (ns *NullString) MarshalJSON() ([]byte, error) {
	if !ns.Valid {
		return []byte("null"), nil
	}
	return json.Marshal(ns.String)
}

func (ns *NullString) UnmarshalJSON(b []byte) error {
	ns.Valid = string(b) != "null"
	e := json.Unmarshal(b, &ns.String)
	return e
}

type NullInt32 struct {
	sql.NullInt32
}

func (ni *NullInt32) MarshalJSON() ([]byte, error) {
	if !ni.Valid {
		return []byte("null"), nil
	}
	return json.Marshal(ni.Int32)
}

func (ni *NullInt32) UnmarshalJSON(b []byte) error {
	s := string(b)
	if s == "null" {
		ni.Valid = false
		return nil
	}

	value, err := strconv.ParseInt(s, 10, 32)
	if err != nil {
		return err
	}

	ni.Int32 = int32(value)
	ni.Valid = true
	return nil
}

type NullFloat64 struct {
	sql.NullFloat64
}

func (nf *NullFloat64) MarshalJSON() ([]byte, error) {
	if !nf.Valid {
		return []byte("null"), nil
	}
	return json.Marshal(nf.Float64)
}

type NullInt64 struct {
	sql.NullInt64
}

func (nf *NullInt64) MarshalJSON() ([]byte, error) {
	if !nf.Valid {
		return []byte("null"), nil
	}
	return json.Marshal(nf.NullInt64)
}

type Int64Array struct {
	pq.Int64Array
}

func (a *Int64Array) MarshalJSON() ([]byte, error) {
	values := make([]string, len(a.Int64Array))
	for i, value := range []int64(a.Int64Array) {
		values[i] = fmt.Sprintf(`%v`, value)
	}
	return []byte(fmt.Sprintf("[%v]", strings.Join(values, ","))), nil

}
func (a *Int64Array) UnmarshalJSON(b []byte) error {
	return json.Unmarshal(b, &a.Int64Array)
}

func (a *Int64Array) Values() []int64 {
	return a.Int64Array
}

type UserArray []User

func (u *UserArray) UnmarshalJSON(b []byte) error {
	var list []json.RawMessage
	if err := json.Unmarshal(b, &list); err != nil {
		return err
	}
	slice := make(UserArray, len(list))
	for i, elemText := range list {
		item := User{}
		err := json.Unmarshal(elemText, &item)
		if err != nil {
			return err
		}
		slice[i] = item
	}
	*u = slice
	return nil
}

func (u *UserArray) Scan(src interface{}) error {
	switch v := src.(type) {
	case []byte:
		return json.Unmarshal(v, u)
	case string:
		return json.Unmarshal([]byte(v), u)
	}
	return errors.New("type assertion failed")
}
