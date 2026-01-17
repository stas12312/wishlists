import { AuthInfo, IUser } from "../models/user";
import { IError } from "../models";

import { clientAxios } from "./base";

export async function getMe(): Promise<IUser> {
  const response = await clientAxios.get("/user/me");

  return response.data;
}
export async function getAuthInfo(): Promise<AuthInfo> {
  const response = await clientAxios.get("user/auth-info");
  return response.data as AuthInfo;
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<IError> {
  const response = await clientAxios.post("user/change-password", {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return response.data;
}

export async function deleteAccount(): Promise<IError> {
  const response = await clientAxios.delete("user/");
  return response.data;
}

export async function getUserFriendsCount(username: string): Promise<number> {
  const response = await clientAxios.get(`users/${username}/friends/info`);
  return response.data.friends as number;
}

export async function getUserFriends(
  username: string,
): Promise<IUser[] | IError> {
  const response = await clientAxios.get(`users/${username}/friends`);
  if (response.status != 200) {
    return response.data as IError;
  }
  return response.data.data;
}

export async function getUserByUsername(username: string): Promise<IUser> {
  const response = await clientAxios.get(`user/${username}`);
  return response.data;
}

export async function updateUser(user: IUser): Promise<IUser | IError> {
  const response = await clientAxios.post("user", {
    ...user,
  });
  return response.data;
}
