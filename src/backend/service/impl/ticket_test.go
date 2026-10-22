package impl

import "testing"

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
