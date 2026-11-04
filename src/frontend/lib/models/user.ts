export interface IUser {
  id: number;
  name: string;
  email: string;
  username: string;
  image: string;
  birthday?: string;
}

export interface OAuthLink {
  provider: string;
  oauth_user_id: string;
}

export interface AuthInfo {
  providers: { name: string; url: string }[];
  has_email: boolean;
  links: OAuthLink[];
  has_password: boolean;
}
