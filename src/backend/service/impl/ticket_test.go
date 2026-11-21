package impl

import (
	"bytes"
	"context"
	"io"
	"main/model"
	"main/repository"
	"main/repository/mocks"
	"main/service"
	servicemocks "main/service/mocks"
	"main/uof"
	"strings"
	"testing"
)

type ticketRepositoryStub struct {
	ticket  model.Ticket
	updated *model.Ticket
}

func (r *ticketRepositoryStub) Create(ticket *model.Ticket) (*model.Ticket, error) {
	return ticket, nil
}

func (r *ticketRepositoryStub) List(int64, int64, model.Navigation, model.TicketFilters) ([]model.Ticket, error) {
	return []model.Ticket{r.ticket}, nil
}

func (r *ticketRepositoryStub) Get(int64) (*model.Ticket, error) {
	return &r.ticket, nil
}

func (r *ticketRepositoryStub) Update(ticket *model.Ticket) (*model.Ticket, error) {
	r.updated = ticket
	return ticket, nil
}

func (r *ticketRepositoryStub) Delete(int64) error {
	return nil
}

func (r *ticketRepositoryStub) GetCounters(int64) (int, error) {
	return 0, nil
}

type messageServiceStub struct {
	createMessageCalls int
}

func (s *messageServiceStub) CreateConversation() (*model.Conversation, error) {
	return &model.Conversation{}, nil
}

func (s *messageServiceStub) CreateMessage(int64, int64, string, model.Attachments) (*model.Message, error) {
	s.createMessageCalls++
	return &model.Message{}, nil
}

func (s *messageServiceStub) ListMessages(int64) ([]model.Message, error) {
	return nil, nil
}

func TestTicketServiceImpl_AddMessageFromAdminCommandOnly(t *testing.T) {
	ticketRepository := &ticketRepositoryStub{ticket: model.Ticket{Id: 1, AuthorId: 42, ConversationId: 7}}
	messageService := &messageServiceStub{}
	wsService := servicemocks.NewWSService(t)
	wsService.On("SendMessage", int64(42), model.WSMessage{Event: service.ChangeTicketsCount}).Once()
	wsService.On("SendMessageToChannel", "ticket_1", model.WSMessage{Event: service.Update}).Once()
	s := NewTicketServiceImpl(ticketRepository, nil, messageService, wsService, nil, nil, "", nil, nil, "", nil)

	message, err := s.AddMessageFromAdmin(context.Background(), 1, 1, &model.Message{Content: "/status resolved"})
	if err != nil {
		t.Fatalf("AddMessageFromAdmin() error = %v", err)
	}
	if message != nil {
		t.Errorf("AddMessageFromAdmin() message = %+v, want nil", message)
	}
	if ticketRepository.updated == nil || ticketRepository.updated.Status != "resolved" {
		t.Errorf("updated ticket = %+v, want status resolved", ticketRepository.updated)
	}
	if messageService.createMessageCalls != 0 {
		t.Errorf("CreateMessage() calls = %d, want 0", messageService.createMessageCalls)
	}
}

type replyTestWork struct {
	store     uof.UnitOfWorkStore
	commitErr error
}

func (w replyTestWork) Do(ctx context.Context, save func(context.Context, uof.UnitOfWorkStore) error) error {
	if err := save(ctx, w.store); err != nil {
		return err
	}
	return w.commitErr
}

type replyTestStore struct {
	uof.UnitOfWorkStore
	messages      repository.MessageRepository
	notifications repository.NotificationRepository
}

func (s replyTestStore) MessageRepository() repository.MessageRepository { return s.messages }
func (s replyTestStore) NotificationRepository() repository.NotificationRepository {
	return s.notifications
}

type replyTestMessages struct {
	repository.MessageRepository
	input *model.Message
}

func (r *replyTestMessages) CreateMessage(message *model.Message) (*model.Message, error) {
	r.input = message
	saved := *message
	saved.Id = 11
	return &saved, nil
}

type replyTestNotifications struct {
	repository.NotificationRepository
	saved model.Notification
}

func (r *replyTestNotifications) Create(notification model.Notification) error {
	r.saved = notification
	return nil
}

func TestTicketServiceImpl_PublishesReplyOnlyAfterCommit(t *testing.T) {
	for _, commitErr := range []error{nil, io.ErrUnexpectedEOF} {
		name := "успешный коммит"
		if commitErr != nil {
			name = "ошибка коммита"
		}
		t.Run(name, func(t *testing.T) {
			tickets := &ticketRepositoryStub{ticket: model.Ticket{Id: 1, AuthorId: 42, ConversationId: 7}}
			messages := &replyTestMessages{}
			notifications := &replyTestNotifications{}
			ws := servicemocks.NewWSService(t)
			if commitErr == nil {
				ws.On("SendMessageToChannel", "ticket_1", model.WSMessage{Event: service.Update}).Once()
				ws.On("SendMessage", int64(42), model.WSMessage{Event: service.NotificationsChanged}).Once()
			}
			work := replyTestWork{store: replyTestStore{messages: messages, notifications: notifications}, commitErr: commitErr}
			s := &TicketServiceImpl{ticketRepository: tickets, wsService: ws, work: work}

			reply, err := s.AddMessageFromAdmin(context.Background(), 2, 1, &model.Message{Content: " Ответ "})
			if commitErr == nil && (err != nil || reply == nil || reply.Id != 11) {
				t.Fatalf("reply = %+v, error = %v", reply, err)
			}
			if commitErr != nil && (err == nil || reply != nil) {
				t.Fatalf("reply = %+v, error = %v after failed commit", reply, err)
			}
			want := model.Notification{
				RecipientId: 42,
				Kind:        model.NotificationSupportReply,
				EventKey:    "11",
				ResourceKey: "1",
				Body:        "Ответ",
			}
			if notifications.saved != want {
				t.Errorf("notification = %+v, want %+v", notifications.saved, want)
			}
			if messages.input == nil || messages.input.ConversationId != 7 || messages.input.SenderId != 2 || messages.input.Content != "Ответ" {
				t.Errorf("saved message = %+v", messages.input)
			}
		})
	}
}

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
		size     int64
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
		{
			name:     "Слишком большой файл",
			filename: "big.zip",
			size:     5*1024*1024 + 1,
			wantErr:  true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fileRepository := mocks.NewImageRepository(t)
			file := bytes.NewBufferString("data")
			if !tt.wantErr {
				fileRepository.On("UploadAttachment", tt.wantKey, tt.wantName, file).Once().Return("https://cdn/"+tt.wantKey, nil)
			}
			size := tt.size
			if size == 0 {
				size = 4
			}
			s := NewTicketServiceImpl(nil, nil, nil, nil, fileRepository, func() string { return "UUID" }, "https://cdn", nil, nil, "", nil)

			got, err := s.UploadAttachment(tt.filename, size, file)
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
			message: model.Message{Attachments: model.Attachments{{Url: "https://cdn/tickets/../images/x.png", Name: "x.png", Size: 1}}},
			wantErr: true,
		},
		{
			name:    "Закодированный выход из каталога",
			message: model.Message{Attachments: model.Attachments{{Url: "https://cdn/tickets/%2e%2e/images/x.png", Name: "x.png", Size: 1}}},
			wantErr: true,
		},
		{
			name:    "Расширение имени не совпадает с файлом",
			message: model.Message{Attachments: model.Attachments{{Url: attachment.Url, Name: "a.pdf", Size: 1}}},
			wantErr: true,
		},
		{
			name:    "Пустое имя",
			message: model.Message{Attachments: model.Attachments{{Url: attachment.Url, Name: " ", Size: 1}}},
			wantErr: true,
		},
		{
			name:    "Слишком длинное имя",
			message: model.Message{Attachments: model.Attachments{{Url: attachment.Url, Name: strings.Repeat("я", 300) + ".png", Size: 1}}},
			wantErr: true,
		},
		{
			name:    "Некорректный размер",
			message: model.Message{Attachments: model.Attachments{{Url: attachment.Url, Name: "a.png", Size: 0}}},
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
	s := NewTicketServiceImpl(nil, nil, nil, nil, nil, nil, "https://cdn", nil, nil, "", nil)
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := s.validateMessage(&tt.message)
			if (err != nil) != tt.wantErr {
				t.Errorf("validateMessage() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestEscapeMailText(t *testing.T) {
	got := escapeMailText(`<a href="x">{link}</a>`)
	want := "&lt;a href=&#34;x&#34;&gt;&#123;link&#125;&lt;/a&gt;"
	if got != want {
		t.Errorf("escapeMailText() = %q, want %q", got, want)
	}
}
