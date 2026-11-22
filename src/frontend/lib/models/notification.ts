export type NotificationKind =
  | "support.reply"
  | "question.created"
  | "question.answered"
  | "friend.requested"
  | "friend.accepted"
  | "friend.declined";

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
export type NotificationPreferenceKind = NotificationKind | "friend.requests";

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
  { kind: "friend.requested", label: "Входящие заявки в друзья" },
  { kind: "friend.accepted", label: "Принятие моих заявок в друзья" },
  { kind: "friend.declined", label: "Отклонение моих заявок в друзья" },
] as const;
