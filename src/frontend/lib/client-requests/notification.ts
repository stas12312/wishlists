import { AxiosResponse } from "axios";

import {
  NotificationChannel,
  NotificationKind,
  NotificationPage,
  NotificationPreference,
} from "../models/notification";

import { clientAxios } from "./base";

function notificationData<T>(response: AxiosResponse<{ data: T }>): T {
  if (response.status >= 400) {
    throw new Error("Не удалось выполнить запрос уведомлений");
  }
  return response.data.data;
}

export async function getUnreadNotifications(signal: AbortSignal) {
  const response = await clientAxios.get<{ data: { count: number } }>(
    "/notifications/unread",
    { signal },
  );
  return notificationData(response).count;
}

export async function listNotifications(before: number, signal?: AbortSignal) {
  const response = await clientAxios.get<{ data: NotificationPage }>(
    "/notifications",
    { params: { before }, signal },
  );
  return notificationData(response);
}

export async function markAllNotificationsRead() {
  const response = await clientAxios.put("/notifications/read");
  if (response.status !== 204) {
    throw new Error("Не удалось отметить уведомления прочитанными");
  }
}

export async function markVisibleNotificationsRead(ids: number[]) {
  const response = await clientAxios.put("/notifications/read/visible", {
    ids,
  });
  if (response.status !== 204) {
    throw new Error("Не удалось отметить уведомления прочитанными");
  }
}

export async function markNotificationEventsRead(
  kind: string,
  resourceKey: string,
  eventKeys?: string[],
) {
  async function markRead(keys?: string[]) {
    const response = await clientAxios.put("/notifications/read/events", {
      kind,
      resource_key: resourceKey,
      event_keys: keys,
    });
    if (response.status !== 204) {
      throw new Error("Не удалось отметить уведомления прочитанными");
    }
  }
  if (!eventKeys) {
    await markRead();
    return;
  }

  const batchSize = 500;
  for (let offset = 0; offset < eventKeys.length; offset += batchSize) {
    await markRead(eventKeys.slice(offset, offset + batchSize));
  }
}

export async function getNotificationPreferences(signal: AbortSignal) {
  const response = await clientAxios.get<{
    data: Record<NotificationKind, NotificationPreference[]>;
  }>("/notifications/preferences", { signal });
  return notificationData(response);
}

export async function setNotificationPreference(
  kind: NotificationKind,
  channel: NotificationChannel,
  enabled: boolean,
) {
  const response = await clientAxios.put(
    `/notifications/preferences/${kind}/${channel}`,
    { enabled },
  );
  if (response.status !== 204) {
    throw new Error("Не удалось сохранить настройки уведомлений");
  }
}
