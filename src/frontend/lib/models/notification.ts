export interface NotificationItem {
  id: number;
  kind: string;
  title: string;
  body: string;
  href: string;
  created_at: string;
  read_at: string | null;
}

export interface NotificationPage {
  items: NotificationItem[];
  next: number;
}

export interface NotificationPreference {
  channel: string;
  enabled: boolean;
  available: boolean;
}
