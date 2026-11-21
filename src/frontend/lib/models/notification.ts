export type NotificationKind =
  | "support.reply"
  | "question.created"
  | "question.answered";

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

export type NotificationChannel = "email" | "telegram";

export interface NotificationPreference {
  channel: NotificationChannel;
  enabled: boolean;
  available: boolean;
  linked?: boolean;
}
