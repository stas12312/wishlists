import { CalendarDate } from "@internationalized/date";

const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export function dateStringToCalendarDate(
  dateString: string | null,
): CalendarDate | null {
  if (!dateString) {
    return null;
  }
  const date = new Date(dateString);

  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}

export function getDisplayDate(rawDate?: string): string {
  if (!rawDate) {
    return "";
  }

  const date = new Date(rawDate);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function prepareDateString(rawDate: string): string {
  const date = new Date(rawDate);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  const isCurrentYear = date.getFullYear() === now.getFullYear();
  const options = {
    month: "2-digit" as "2-digit",
    day: "2-digit" as "2-digit",
    hour: "2-digit" as "2-digit",
    minute: "2-digit" as "2-digit",
    year: isCurrentYear ? undefined : ("numeric" as "numeric"),
  };

  return date.toLocaleString(undefined, options);
}
