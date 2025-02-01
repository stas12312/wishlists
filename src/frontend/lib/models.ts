import { IUser } from "./models/user";

export interface IRegisterData {
  uuid: string;
  secret_key: string;
  key?: string;
}

export interface ITokens {
  access_token: string;
  refresh_token: string;
}

export interface IFieldError {
  name: string;
  tag: string;
  message: string;
}

export interface IError {
  message: string;
  details: string;
  code: number;
  fields?: IFieldError[];
}

export interface IOAuthProvider {
  name: string;
  url: string;
  logo: string;
}

export interface IFriendRequest {
  from_user: IUser;
  to_user: IUser;
  status: number;
}

export enum FriendStatus {
  no_friend = 0,
  has_outcoming_request = 1,
  has_incoming_request = 2,
  is_friend = 3,
  is_yourself = 4,
}

export interface FriendsCounters {
  friends: number;
  incoming_requests: number;
}

export interface INavigation {
  count?: number;
  cursor: string[];
}

export interface ListResponse<T> {
  data: T[];
  navigation: INavigation;
}

export type Cursor = string[];
