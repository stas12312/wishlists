import { ReactNode } from "react";

export interface IOAuthProvider {
  name: string;
  url: string;
  logo: string;
  icon?: ReactNode;
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
