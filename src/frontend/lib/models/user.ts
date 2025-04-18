export interface IUser {
  id: number;
  name: string;
  email: string;
  username: string;
  image: string;
  birthday?: string;
}

export interface AuthInfo {
  has_password: boolean;
}
