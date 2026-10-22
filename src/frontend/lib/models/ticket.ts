import { IUser } from "./user";

export interface ITicketCategory {
  id: number;
  title: string;
  color: string;
}

export type TicketStatus =
  | "open"
  | "resolved"
  | "closed"
  | "waiting_info"
  | "waiting_fix";

export interface ITicket {
  id: number;
  subject: string;
  category_id: number;
  status: TicketStatus;
  created_at: string;
  closed_at: string;
  category: ITicketCategory;
  author_id: number;
  author: IUser;
}

export interface ITicketCreate {
  subject: string;
  category_id: number;
  content: string;
  attachments: IAttachment[];
}

export interface IAttachment {
  url: string;
  name: string;
  size: number;
}

export interface IMessage {
  id: number;
  content: string;
  created_at: string;
  sender_id: number;
  attachments: IAttachment[];
}
