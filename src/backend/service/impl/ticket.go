package impl

import (
	"fmt"
	"io"
	apperror "main/error"
	"main/model"
	"main/repository"
	"main/service"
	"path/filepath"
	"regexp"
	"strings"
	"unicode/utf8"
)

var statusCommandRe = regexp.MustCompile(`(?m)^[ \t]*/status[ \t]+(\w+)[ \t]*\r?$`)

var attachmentKeyRe = regexp.MustCompile(`^[0-9A-Za-z-]+\.[0-9a-z]+$`)

const (
	maxAttachmentsCount     = 5
	maxAttachmentSize       = 5 * 1024 * 1024
	maxAttachmentNameLength = 255
	attachmentsDir          = "tickets"
)

var attachmentExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
	".webp": true,
	".heic": true,
	".pdf":  true,
	".txt":  true,
	".log":  true,
	".doc":  true,
	".docx": true,
	".xls":  true,
	".xlsx": true,
	".zip":  true,
}

var ticketStatuses = map[string]bool{
	"open":         true,
	"resolved":     true,
	"closed":       true,
	"waiting_info": true,
	"waiting_fix":  true,
}

func NewTicketServiceImpl(
	ticketRepository repository.TicketRepository,
	categoryRepository repository.TicketCategoryRepository,
	messageService service.MessageService,
	wsService service.WSService,
	fileRepository repository.ImageRepository,
	uuidGenerator UUIDGenerator,
	filesDomain string,
) *TicketServiceImpl {
	return &TicketServiceImpl{
		ticketRepository:         ticketRepository,
		ticketCategoryRepository: categoryRepository,
		messageService:           messageService,
		wsService:                wsService,
		fileRepository:           fileRepository,
		uuidGenerator:            uuidGenerator,
		attachmentsUrlPrefix:     fmt.Sprintf("%s/%s/", filesDomain, attachmentsDir),
	}
}

type TicketServiceImpl struct {
	ticketRepository         repository.TicketRepository
	ticketCategoryRepository repository.TicketCategoryRepository
	messageService           service.MessageService
	wsService                service.WSService
	fileRepository           repository.ImageRepository
	uuidGenerator            UUIDGenerator
	attachmentsUrlPrefix     string
}

func (t *TicketServiceImpl) CreateCategory(ticketCategory *model.TicketCategory) (*model.TicketCategory, error) {
	return t.ticketCategoryRepository.Create(ticketCategory)
}

func (t *TicketServiceImpl) ListCategory() ([]model.TicketCategory, error) {
	return t.ticketCategoryRepository.List()
}

func (t *TicketServiceImpl) Create(ticket *model.Ticket, message *model.Message) (*model.Ticket, error) {
	if err := t.validateMessage(message); err != nil {
		return nil, err
	}
	conversation, err := t.messageService.CreateConversation()
	if err != nil {
		return nil, err
	}
	_, err = t.messageService.CreateMessage(ticket.AuthorId, conversation.Id, message.Content, message.Attachments)
	if err != nil {
		return nil, err
	}
	ticket.ConversationId = conversation.Id
	return t.ticketRepository.Create(ticket)
}

func (t *TicketServiceImpl) List(userId int64, navigation model.Navigation, filters model.TicketFilters) ([]model.Ticket, error) {
	return t.ticketRepository.List(userId, 0, navigation, filters)
}

func (t *TicketServiceImpl) Get(userId int64, id int64) (*model.Ticket, error) {
	tickets, err := t.ticketRepository.List(userId, id, model.Navigation{Cursor: []string{""}, Count: 1}, model.TicketFilters{})
	if len(tickets) == 0 || err != nil {
		return nil, apperror.NewError(apperror.NotFound, "Обращение на найдено")
	}
	if userId > 0 && tickets[0].AuthorId != userId {
		return nil, apperror.NewError(apperror.NotFound, "Обращение не найдено")
	}

	return &tickets[0], nil
}

func (t *TicketServiceImpl) GetConversation(userId int64, ticketId int64) ([]model.Message, error) {
	ticket, err := t.Get(userId, ticketId)
	if err != nil {
		return nil, err
	}
	return t.messageService.ListMessages(ticket.ConversationId)
}

func (t *TicketServiceImpl) AddMessage(userId int64, ticketId int64, message *model.Message) (*model.Message, error) {
	ticket, err := t.Get(userId, ticketId)
	if err != nil {
		return nil, err
	}
	if err = t.validateMessage(message); err != nil {
		return nil, err
	}

	createdMessage, err := t.messageService.CreateMessage(userId, ticket.ConversationId, message.Content, message.Attachments)
	if err != nil {
		return nil, err
	}
	if ticket.Status == "waiting_info" || ticket.Status == "closed" {
		_, err = t.ticketRepository.Update(&model.Ticket{Id: ticketId, Status: "open"})
		t.wsService.SendMessage(userId, model.WSMessage{Event: service.ChangeTicketsCount})
		if err != nil {
			return nil, err
		}
	}
	t.wsService.SendMessageToChannel(getChannelNameForTicket(ticketId), model.WSMessage{
		Event: service.Update,
	})
	return createdMessage, nil
}

func (t *TicketServiceImpl) AddMessageFromAdmin(userId int64, ticketId int64, message *model.Message) (*model.Message, error) {
	ticket, err := t.Get(0, ticketId)
	if err != nil {
		return nil, err
	}
	content, status := splitMessage(message.Content)
	if status != "" && !ticketStatuses[status] {
		return nil, apperror.NewError(apperror.ValidateError, fmt.Sprintf("Неизвестный статус обращения: %s", status))
	}
	message.Content = content
	if err = t.validateMessage(message); err != nil {
		return nil, err
	}

	if status != "" {
		_, err = t.ticketRepository.Update(&model.Ticket{Id: ticketId, Status: status})
		if err != nil {
			return nil, err
		}
		t.wsService.SendMessage(ticket.AuthorId, model.WSMessage{Event: service.ChangeTicketsCount})
	}

	createdMessage, err := t.messageService.CreateMessage(userId, ticket.ConversationId, message.Content, message.Attachments)
	if err != nil {
		return nil, err
	}
	t.wsService.SendMessageToChannel(getChannelNameForTicket(ticketId), model.WSMessage{
		Event: service.Update,
	})
	return createdMessage, nil
}

func (t *TicketServiceImpl) UploadAttachment(filename string, size int64, file io.Reader) (*model.Attachment, error) {
	name := strings.TrimSpace(filepath.Base(filename))
	extension := strings.ToLower(filepath.Ext(name))
	if !attachmentExtensions[extension] {
		return nil, apperror.NewError(apperror.ValidateError, "Недопустимый тип файла")
	}
	if size > maxAttachmentSize {
		return nil, apperror.NewError(apperror.ValidateError, "Размер файла превышает 5 МБ")
	}
	if utf8.RuneCountInString(name) > maxAttachmentNameLength {
		name = string([]rune(name)[:maxAttachmentNameLength-len(extension)]) + extension
	}

	url, err := t.fileRepository.UploadAttachment(fmt.Sprintf("%s/%s%s", attachmentsDir, t.uuidGenerator(), extension), name, file)
	if err != nil {
		return nil, err
	}
	return &model.Attachment{Url: url, Name: name, Size: size}, nil
}

// validateMessage допускает только файлы, загруженные через UploadAttachment,
// чтобы в сообщение нельзя было подложить ссылку на сторонний ресурс
func (t *TicketServiceImpl) validateMessage(message *model.Message) error {
	message.Content = strings.TrimSpace(message.Content)
	if message.Content == "" && len(message.Attachments) == 0 {
		return apperror.NewError(apperror.ValidateError, "Сообщение не может быть пустым")
	}
	if len(message.Attachments) > maxAttachmentsCount {
		return apperror.NewError(apperror.ValidateError, fmt.Sprintf("Можно прикрепить не более %d файлов", maxAttachmentsCount))
	}
	for i := range message.Attachments {
		if !t.isValidAttachment(&message.Attachments[i]) {
			return apperror.NewError(apperror.ValidateError, "Некорректное вложение")
		}
	}
	return nil
}

func (t *TicketServiceImpl) isValidAttachment(attachment *model.Attachment) bool {
	// Ключ должен быть плоским именем файла без «/», «%» и «..», иначе CDN может нормализовать путь за пределы каталога
	key, found := strings.CutPrefix(attachment.Url, t.attachmentsUrlPrefix)
	if !found || !attachmentKeyRe.MatchString(key) {
		return false
	}
	extension := filepath.Ext(key)
	if !attachmentExtensions[extension] {
		return false
	}

	attachment.Name = strings.TrimSpace(attachment.Name)
	nameLength := utf8.RuneCountInString(attachment.Name)
	if nameLength == 0 || nameLength > maxAttachmentNameLength ||
		strings.ToLower(filepath.Ext(attachment.Name)) != extension {
		return false
	}
	return attachment.Size > 0 && attachment.Size <= maxAttachmentSize
}

func (t *TicketServiceImpl) Close(userId int64, ticketId int64) error {
	_, err := t.Get(userId, ticketId)
	if err != nil {
		return err
	}
	_, err = t.ticketRepository.Update(&model.Ticket{Id: ticketId, Status: "closed"})
	if err != nil {
		return err
	}
	t.wsService.SendMessageToChannel(getChannelNameForTicket(ticketId), model.WSMessage{
		Event: service.Update,
	})
	t.wsService.SendMessage(userId, model.WSMessage{Event: service.ChangeTicketsCount})
	return nil
}

func (t *TicketServiceImpl) GetCounters(userId int64) (int, error) {
	return t.ticketRepository.GetCounters(userId)
}

// splitMessage вырезает из сообщения команду смены статуса — отдельную строку вида "/status waiting_info".
// Если команд несколько, применяется последняя.
func splitMessage(content string) (string, string) {
	matches := statusCommandRe.FindAllStringSubmatch(content, -1)
	if len(matches) == 0 {
		return strings.TrimSpace(content), ""
	}
	content = statusCommandRe.ReplaceAllString(content, "")
	return strings.TrimSpace(content), matches[len(matches)-1][1]
}

func getChannelNameForTicket(ticketId int64) string {
	return fmt.Sprintf("ticket_%d", ticketId)
}
