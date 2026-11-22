import { ChipColor, StatusChip } from "./parseCommon";

export const siteStatuses: Record<string, [string, ChipColor]> = {
  read: ["Прочитано", "accent"],
  unread: ["Не прочитано", "default"],
};

export const deliveryStatuses: Record<string, [string, ChipColor]> = {
  sent: ["Отправлено", "success"],
  failed: ["Ошибка", "danger"],
  pending: ["В очереди", "warning"],
  skipped: ["Пропущено", "default"],
};

export function NotificationStatus({
  status,
  site = false,
}: {
  status: string | null;
  site?: boolean;
}) {
  if (!status)
    return (
      <span className="text-muted" title="Отправка не планировалась">
        —
      </span>
    );
  return (
    <StatusChip
      size="sm"
      statuses={site ? siteStatuses : deliveryStatuses}
      value={status}
    />
  );
}

export const notificationDate = new Intl.DateTimeFormat("ru-RU", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
export const notificationTime = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});

export function notificationDateTime(value: string) {
  const date = new Date(value);
  return `${notificationDate.format(date)}, ${notificationTime.format(date)}`;
}
