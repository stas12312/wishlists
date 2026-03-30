import { clientAxios } from "../base";

import { IError, ListResponse } from "@/lib/models";
import { IResponse } from "@/lib/models/response";
import { IMessage, ITicket } from "@/lib/models/ticket";

export async function getTicketsForAdmin(): Promise<ListResponse<ITicket>> {
  const response = await clientAxios.get("/admin/tickets");
  return response.data;
}

export async function getTicketForAdmin(
  ticketId: number,
): Promise<IResponse<ITicket> | IError> {
  const response = await clientAxios.get(`/admin/tickets/${ticketId}`);
  return response.data;
}

export async function getTicketMessagesForAdmin(
  ticketId: number,
): Promise<IMessage[]> {
  const response = await clientAxios.get(
    `/admin/tickets/${ticketId}/conversation`,
  );
  return response.data.data;
}

export async function addTicketMessageForAdmin(
  ticketId: number,
  content: string,
): Promise<IMessage> {
  const response = await clientAxios.post(
    `/admin/tickets/${ticketId}/conversation`,
    {
      content: content,
    },
  );
  return response.data.data;
}
