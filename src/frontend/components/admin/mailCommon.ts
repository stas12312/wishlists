import { ChipColor } from "./parseCommon";

import { MailStatus } from "@/lib/models/mail";

export const MAIL_STATUSES: Record<MailStatus, [string, ChipColor]> = {
  pending: ["Отправляется", "accent"],
  sent: ["Отправлено", "success"],
  failed: ["Ошибка", "danger"],
};
