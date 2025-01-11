import { IUser } from "./user";

export interface IWishlist {
  uuid: string;
  name: string;
  description?: string;
  created_at: string;
  date?: string;
  user_id: number;
  is_active: boolean;
  wishes_count: number;
  visible: 0 | 1 | 2;
  user?: IUser;
}

export interface IWishlistAction {
  edit: boolean;
  filter: boolean;
}
