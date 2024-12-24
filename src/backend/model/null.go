package model

import (
	"database/sql"
	"encoding/json"
	"fmt"
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
	s := strings.ReplaceAll(string(b), "\"", "")
	if s == "null" {
		ns.Valid = false
		return nil
	}

	ns.String = s
	ns.Valid = true
	return nil
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
