package impl

import (
	"bytes"
	"main/model"
	"main/repository/mocks"
	"strings"
	"testing"
)

func TestSplitMessage(t *testing.T) {
	tests := []struct {
		name        string
		content     string
		wantContent string
		wantStatus  string
	}{
		{
			name:        "Без команды",
			content:     "Сообщение",
			wantContent: "Сообщение",
		},
		{
			name:        "Ссылка не считается командой",
			content:     "Смотрите https://example.com/path",
			wantContent: "Смотрите https://example.com/path",
		},
		{
			name:        "Команда отдельной строкой",
			content:     "Ссылка: https://example.com\n/status waiting_info",
			wantContent: "Ссылка: https://example.com",
			wantStatus:  "waiting_info",
		},
		{
			name:        "Команда в начале и CRLF",
			content:     "/status resolved\r\nГотово",
			wantContent: "Готово",
			wantStatus:  "resolved",
		},
		{
			name:        "Применяется последняя команда",
			content:     "/status waiting_fix\nТекст\n/status closed",
			wantContent: "Текст",
			wantStatus:  "closed",
		},
		{
			name:        "Команда внутри строки игнорируется",
			content:     "Напишите /status closed",
			wantContent: "Напишите /status closed",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			content, status := splitMessage(tt.content)
			if content != tt.wantContent {
				t.Errorf("content = %q, want %q", content, tt.wantContent)
			}
			if status != tt.wantStatus {
				t.Errorf("status = %q, want %q", status, tt.wantStatus)
			}
		})
	}
}

func TestTicketServiceImpl_UploadAttachment(t *testing.T) {
	tests := []struct {
		name     string
		filename string
		wantKey  string
		wantName string
		wantErr  bool
	}{
		{
			name:     "Расширение приводится к нижнему регистру",
			filename: "Скриншот.PNG",
			wantKey:  "tickets/UUID.png",
			wantName: "Скриншот.PNG",
		},
		{
			name:     "Путь отбрасывается",
			filename: "../../logs/app.log",
			wantKey:  "tickets/UUID.log",
			wantName: "app.log",
		},
		{
			name:     "Длинное имя обрезается с сохранением расширения",
			filename: strings.Repeat("я", 300) + ".pdf",
			wantKey:  "tickets/UUID.pdf",
			wantName: strings.Repeat("я", 251) + ".pdf",
		},
		{
			name:     "Недопустимое расширение",
			filename: "page.html",
			wantErr:  true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fileRepository := mocks.NewImageRepository(t)
			file := bytes.NewBufferString("data")
			if !tt.wantErr {
				fileRepository.On("Upload", tt.wantKey, file).Once().Return("https://cdn/"+tt.wantKey, nil)
			}
			s := NewTicketServiceImpl(nil, nil, nil, nil, fileRepository, func() string { return "UUID" }, "https://cdn")

			got, err := s.UploadAttachment(tt.filename, 4, file)
			if (err != nil) != tt.wantErr {
				t.Fatalf("UploadAttachment() error = %v, wantErr %v", err, tt.wantErr)
			}
			if tt.wantErr {
				return
			}
			want := model.Attachment{Url: "https://cdn/" + tt.wantKey, Name: tt.wantName, Size: 4}
			if *got != want {
				t.Errorf("UploadAttachment() = %+v, want %+v", *got, want)
			}
		})
	}
}

func TestTicketServiceImpl_ValidateMessage(t *testing.T) {
	attachment := model.Attachment{Url: "https://cdn/tickets/UUID.png", Name: "a.png", Size: 1}
	tests := []struct {
		name    string
		message model.Message
		wantErr bool
	}{
		{name: "Только текст", message: model.Message{Content: "Текст"}},
		{name: "Только вложение", message: model.Message{Attachments: model.Attachments{attachment}}},
		{name: "Пустое сообщение", message: model.Message{Content: "  \n"}, wantErr: true},
		{
			name:    "Сторонняя ссылка",
			message: model.Message{Attachments: model.Attachments{{Url: "https://evil.com/tickets/x.png"}}},
			wantErr: true,
		},
		{
			name:    "Файл вне каталога вложений",
			message: model.Message{Attachments: model.Attachments{{Url: "https://cdn/tickets/../images/x.png"}}},
			wantErr: true,
		},
		{
			name: "Слишком много вложений",
			message: model.Message{Attachments: model.Attachments{
				attachment, attachment, attachment, attachment, attachment, attachment,
			}},
			wantErr: true,
		},
	}
	s := NewTicketServiceImpl(nil, nil, nil, nil, nil, nil, "https://cdn")
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := s.validateMessage(&tt.message)
			if (err != nil) != tt.wantErr {
				t.Errorf("validateMessage() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
