export type NotificationKind =
  | "support.reply"
  | "question.created"
  | "question.answered";

export interface NotificationItem {
  id: number;
  kind: string;
  title: string;
  entity_title?: string;
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

export const notificationChannels = [
  { id: "email", label: "Email" },
  { id: "telegram", label: "Telegram" },
] as const;

export const notificationTypes = [
  { kind: "support.reply", label: "Ответы поддержки" },
  { kind: "question.created", label: "Новые вопросы о желаниях" },
  { kind: "question.answered", label: "Ответы на мои вопросы" },
] as const;
