"use server";
import { IError } from "../models";
import { AuthInfo, IUser } from "../models/user";

import { axiosInstance } from "./base";

export async function getAuthInfo(): Promise<AuthInfo> {
  const response = await axiosInstance.get("user/auth-info");
  return response.data as AuthInfo;
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<IError> {
  const response = await axiosInstance.post("user/change-password", {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return response.data;
}

export async function deleteAccount(): Promise<IError> {
  const response = await axiosInstance.delete("user/");
  return response.data;
}

export async function getUserFriendsCount(username: string): Promise<number> {
  const response = await axiosInstance.get(`users/${username}/friends/info`);
  return response.data.friends as number;
}

export async function getUserFriends(
  username: string,
): Promise<IUser[] | IError> {
  const response = await axiosInstance.get(`users/${username}/friends`);
  if (response.status != 200) {
    return response.data as IError;
  }
  return response.data.data;
}
