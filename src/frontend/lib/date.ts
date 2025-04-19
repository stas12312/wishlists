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
