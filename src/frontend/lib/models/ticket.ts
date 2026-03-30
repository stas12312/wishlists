import { IUser } from "./user";

export interface ITicketCategory {
  id: number;
  title: string;
  color: string;
}

export interface ITicket {
  id: number;
  subject: string;
  category_id: number;
  status: "open" | "closed";
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
}

export interface IMessage {
  id: number;
  content: string;
  created_at: string;
  sender_id: number;
}
