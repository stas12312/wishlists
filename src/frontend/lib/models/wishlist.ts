import { IUser } from "./user";

export enum Visible {
  Private = 0,
  Public,
  ForFriends,
  ForSelectedFriends,
}

export interface IWishlistSettings {
  color: string;
  emoji: string;
}

export interface IWishlist {
  uuid: string;
  name: string;
  description?: string;
  created_at: string;
  date?: string;
  user_id: number;
  is_active: boolean;
  wishes_count: number;
  visible: Visible;
  settings?: IWishlistSettings;
  user?: IUser;
  visible_user_ids: number[];
}

export interface IWishlistAction {
  edit: boolean;
  filter: boolean;
}
