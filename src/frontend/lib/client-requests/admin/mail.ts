import { clientAxios } from "../base";

import { INavigation, ListResponse } from "@/lib/models";
import { IResponse } from "@/lib/models/response";
import { IMailLog, MailStatus } from "@/lib/models/mail";

export async function getMailLogs(
  navigation: INavigation,
  status?: MailStatus,
): Promise<ListResponse<IMailLog>> {
  const response = await clientAxios.get("/admin/mails", {
    params: {
      cursor: navigation.cursor,
      count: navigation.count,
      status: status,
    },
  });
  return response.data;
}

export async function getMailLog(id: number): Promise<IMailLog> {
  const response = await clientAxios.get<IResponse<IMailLog>>(
    `/admin/mails/${id}`,
  );
  return response.data.data;
}

export async function clearOldMailBodies(): Promise<number> {
  const response =
    await clientAxios.post<IResponse<{ cleared: number }>>(
      "/admin/mails/clear",
    );
  return response.data.data.cleared;
}
