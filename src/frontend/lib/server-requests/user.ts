import { IUser } from "../models/user";

import { serverAxios } from "./base";

export async function getUserByUsername(username: string): Promise<IUser> {
  const response = await serverAxios.get(`user/${username}`);
  return response.data;
}
