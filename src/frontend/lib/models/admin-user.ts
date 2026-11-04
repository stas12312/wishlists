export interface IAdminUser {
  id: number;
  name: string;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  has_password: boolean;
}

export interface IUserLink {
  provider: string;
  oauth_user_id: string;
  user_id: number;
}

export interface IAdminUserDetail extends IAdminUser {
  links: IUserLink[];
}
