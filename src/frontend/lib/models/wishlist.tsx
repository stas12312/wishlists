import { IUser } from "../models";

export interface IWishlist {
  uuid: string;
  name: string;
  description?: string;
  created_at: string;
  date?: string;
  user_id: number;
  is_active: boolean;
  wishes_count: number;
  visible: number;
  user?: IUser;
}

export interface IWishlistAction {
  edit: boolean;
  filter: boolean;
}

