package oauth

type Provider struct {
	Name string `json:"name"`
	Url  string `json:"url"`
	Logo string `json:"logo"`
}

func NewManager(clients ...Client) *Manager {
	return &Manager{
		Clients: clients,
	}
}

type Manager struct {
	Clients []Client
}

func (m Manager) GetProviders() []Provider {
	info := make([]Provider, 0, len(m.Clients))

	for _, client := range m.Clients {
		info = append(info, Provider{Name: client.GetProvider(), Url: client.GetAuthUrl(), Logo: client.GetLogoUrl()})
	}

	return info
}

func (m Manager) GetClientByProvider(provider string) Client {
	var resultClient Client
	for _, client := range m.Clients {
		if client.GetProvider() == provider {
			resultClient = client
		}
	}
	return resultClient
}
