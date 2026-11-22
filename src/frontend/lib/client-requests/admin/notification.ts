import { clientAxios } from "../base";

import {
  AdminNotificationDetail,
  AdminNotificationFilters,
  AdminNotificationPage,
  AdminNotificationQuestion,
} from "@/lib/models/admin-notification";
import { IResponse } from "@/lib/models/response";

export async function listAdminNotifications(
  {
    recipientId,
    search,
    kind,
    channel,
    status,
    pushSends,
  }: AdminNotificationFilters,
  since: string | undefined,
  before: string,
  signal: AbortSignal,
): Promise<AdminNotificationPage> {
  const response = await clientAxios.get<IResponse<AdminNotificationPage>>(
    "/admin/notifications",
    {
      params: {
        recipient_id: recipientId,
        search,
        kind,
        channel,
        status,
        push_sends: pushSends || undefined,
        since,
        before,
      },
      signal,
    },
  );
  if (response.status !== 200)
    throw new Error("Не удалось загрузить уведомления");
  return response.data.data;
}

export async function getAdminNotification(
  id: number,
  signal: AbortSignal,
): Promise<AdminNotificationDetail> {
  const response = await clientAxios.get<IResponse<AdminNotificationDetail>>(
    `/admin/notifications/${id}`,
    { signal },
  );
  if (response.status !== 200)
    throw new Error("Не удалось загрузить уведомление");
  return response.data.data;
}

export async function getAdminNotificationQuestion(
  id: number,
  signal: AbortSignal,
): Promise<AdminNotificationQuestion | null> {
  const response = await clientAxios.get<IResponse<AdminNotificationQuestion>>(
    `/admin/notifications/${id}/question`,
    { signal },
  );
  if (response.status === 404) return null;
  if (response.status !== 200) throw new Error("Не удалось загрузить вопрос");
  return response.data.data;
}
