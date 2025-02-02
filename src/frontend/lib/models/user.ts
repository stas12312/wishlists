export interface IUser {
  id: number;
  name: string;
  email: string;
  username: string;
  image: string;
}

export interface AuthInfo {
  has_password: boolean;
}
