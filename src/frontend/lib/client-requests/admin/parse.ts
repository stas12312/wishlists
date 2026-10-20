import { clientAxios } from "../base";

import {
  ParseEvents,
  ParseEventsFilter,
  ParseServiceStatus,
  ParseShopsStatus,
  ParseStats,
} from "@/lib/models/parse";

// Сервис парсинга отвечает 503 с телом состояния, когда он недоступен
const acceptAnyStatus = { validateStatus: () => true };

export async function getParseServiceStatus(): Promise<ParseServiceStatus | null> {
  const response = await clientAxios.get(
    "/admin/parse/status",
    acceptAnyStatus,
  );
  return response.data?.workers ? response.data : null;
}

export async function getParseShopsStatus(): Promise<ParseShopsStatus | null> {
  const response = await clientAxios.get("/admin/parse/shops", acceptAnyStatus);
  return response.status == 200 ? response.data : null;
}

// YYYY-MM-DD в UTC, date_to включительно
export async function getParseStats(
  dateFrom: string,
  dateTo: string,
): Promise<ParseStats | null> {
  const response = await clientAxios.get("/admin/parse/stats", {
    ...acceptAnyStatus,
    params: { date_from: dateFrom, date_to: dateTo },
  });
  return response.status == 200 ? response.data : null;
}

export async function getParseEvents(
  filter: ParseEventsFilter,
): Promise<ParseEvents | null> {
  const response = await clientAxios.get("/admin/parse/events", {
    ...acceptAnyStatus,
    params: filter,
  });
  return response.status == 200 ? response.data : null;
}

export async function getParseEventScreenshot(
  taskId: string,
): Promise<Blob | null> {
  const response = await clientAxios.get(
    `/admin/parse/events/${encodeURIComponent(taskId)}/screenshot`,
    { ...acceptAnyStatus, responseType: "blob" },
  );
  return response.status == 200 ? response.data : null;
}
