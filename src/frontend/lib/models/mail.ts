export type MailStatus = "pending" | "sent" | "failed";

export interface IMailLog {
  id: number;
  recipients: string[];
  subject: string;
  // Приходит только при запросе одного письма, null — содержимое очищено
  body?: string | null;
  has_body: boolean;
  status: MailStatus;
  error: string | null;
  created_at: string;
  sent_at: string | null;
}
