import { IError, ListResponse } from "../models";
import { IResponse } from "../models/response";
import {
  IMessage,
  ITicket,
  ITicketCategory,
  ITicketCreate,
} from "../models/ticket";

import { clientAxios } from "./base";

export async function getTickests(): Promise<ListResponse<ITicket>> {
  const response = await clientAxios.get("/tickets");
  return response.data;
}

export async function createTicket(ticket: ITicketCreate): Promise<ITicket> {
  const response = await clientAxios.post("/tickets", ticket);
  return response.data.data;
}

export async function getTicketCategories(): Promise<
  ListResponse<ITicketCategory>
> {
  const response = await clientAxios.get("/tickets/categories");
  return response.data;
}

export async function getTicket(
  ticketId: number,
): Promise<IResponse<ITicket> | IError> {
  const response = await clientAxios.get(`/tickets/${ticketId}`);
  return response.data;
}

export async function getTicketMessages(ticketId: number): Promise<IMessage[]> {
  const response = await clientAxios.get(`/tickets/${ticketId}/conversation`);
  return response.data.data;
}

export async function addTicketMessage(
  ticketId: number,
  content: string,
): Promise<IMessage> {
  const response = await clientAxios.post(`/tickets/${ticketId}/conversation`, {
    content: content,
  });
  return response.data.data;
}

export async function closeTicket(ticketId: number) {
  await clientAxios.post(`/tickets/${ticketId}/close`);
}
