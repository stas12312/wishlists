import { IWish } from "./wish";

export enum QuestionStatus {
  open = "open",
  resolved = "resolved",
  closed = "closed",
}

export interface IQuestionActions {
  edit: boolean;
  delete: boolean;
  answer: boolean;
}

export interface IAnswer {
  id: number;
  content: string;
  created_at: string;
}

export interface IQuestion {
  id?: number;
  content: string;
  created_at?: string;
  wish_uuid: string;
  actions?: IQuestionActions;
  author_id?: number;
  status?: QuestionStatus;
  answer?: IAnswer;
  wish?: IWish;
}

export interface IQuestionCounters {
  waiting: number;
  answered: number;
}
