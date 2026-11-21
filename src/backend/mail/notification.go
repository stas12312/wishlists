package mail

import (
	"bytes"
	_ "embed"
	"html/template"
	"strings"
)

//go:embed template/notification.html
var notificationHTML string

var notificationTemplate = template.Must(template.New("notification").Parse(notificationHTML))

func RenderNotification(title string, entityTitle *string, message, link, settingsLink string) (string, error) {
	data := struct {
		Title        string
		EntityTitle  *string
		Lines        []string
		Link         string
		SettingsLink string
	}{Title: title, EntityTitle: entityTitle, Link: link, SettingsLink: settingsLink}
	if message != "" {
		data.Lines = strings.Split(message, "\n")
	}

	var body bytes.Buffer
	if err := notificationTemplate.Execute(&body, data); err != nil {
		return "", err
	}
	return withLayout(body.String()), nil
}
