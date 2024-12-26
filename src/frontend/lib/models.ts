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
}

export interface IWish {
  uuid?: string;
  name: string;
  comment: string;
  link?: string;
  wishlist_uuid: string;
  image?: string;
  desirability?: number;
  created_at?: string;
  cost?: number;
  is_active?: boolean;
  user_id?: number;
  is_reserved: boolean;
  actions: IWishActions;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
}

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
  fields?: IFieldError[];
}

export interface IOAuthProvider {
  name: string;
  url: string;
  logo: string;
}

export interface IWishActions {
  edit: boolean
  reserve: boolean
  cancel_reserve: boolean
}
