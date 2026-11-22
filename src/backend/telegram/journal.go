package telegram

import "encoding/json"

func (m *Message) UnmarshalJSON(data []byte) error {
	type message Message
	if err := json.Unmarshal(data, (*message)(m)); err != nil {
		return err
	}
	m.kind = "service"
	if m.Text != "" {
		m.kind = "text"
		return nil
	}
	var fields map[string]json.RawMessage
	if err := json.Unmarshal(data, &fields); err != nil {
		return err
	}
	for _, kind := range []string{
		"animation", "audio", "document", "paid_media", "photo", "sticker", "video",
		"video_note", "voice", "contact", "dice", "game", "poll", "venue", "location", "story",
	} {
		if _, ok := fields[kind]; ok {
			m.kind = kind
			break
		}
	}
	return nil
}

func (u Update) JournalMessage() (*Message, string) {
	for _, original := range []*Message{u.Message, u.ChannelPost, u.BusinessMessage} {
		if original != nil {
			return original, original.kind
		}
	}
	for _, original := range []*Message{u.EditedMessage, u.EditedChannelPost, u.EditedBusinessMessage} {
		if original != nil {
			edited := *original
			edited.Date = original.EditDate
			return &edited, "edited_" + edited.kind
		}
	}
	return nil, ""
}
