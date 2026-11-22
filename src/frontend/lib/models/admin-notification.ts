export interface AdminNotificationFilters {
  recipientId?: number;
  search: string;
  kind: string;
  channel: string;
  status: string;
  period: string;
}

export interface AdminNotification {
  id: number;
  recipient_id: number;
  recipient_name: string;
  username: string;
  kind: string;
  title: string;
  entity_title: string | null;
  created_at: string;
  read_at: string | null;
  email_status: string | null;
  telegram_status: string | null;
}

export interface AdminNotificationDetail extends AdminNotification {
  resource_key: string;
  body: string;
  email_attempts: number | null;
  email_error: string | null;
  telegram_attempts: number | null;
  telegram_error: string | null;
}

export interface AdminNotificationPage {
  items: AdminNotification[];
  next: string;
}

export interface AdminNotificationQuestion {
  content: string;
  answer: string;
}
