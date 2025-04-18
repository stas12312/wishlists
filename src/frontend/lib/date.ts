import { CalendarDate } from "@internationalized/date";

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
