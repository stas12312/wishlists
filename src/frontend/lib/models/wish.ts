import { IUser } from "./user";
import { IWishlist } from "./wishlist";

export interface IWish {
  uuid?: string;
  name: string;
  comment: string;
  link?: string;
  wishlist_uuid: string;
  fulfilled_at?: string;
  images: string[];
  desirability?: number;
  created_at?: string;
  cost?: number;
  is_active?: boolean;
  user_id?: number;
  is_reserved: boolean;
  actions: IWishActions;
  user: IUser;
  wishlist: IWishlist;
  currency: string;
}
export interface IWishActions {
  edit: boolean;
  reserve: boolean;
  cancel_reserve: boolean;
  make_full: boolean;
  cancel_full: boolean;
  open_wishlist: boolean;
}
