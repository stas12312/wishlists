"use server";

import { serverAxios } from "./base";

export async function checkIsAdmin(): Promise<boolean> {
  const response = await serverAxios.get("/admin/is");
  return response.data.data.is_admin;
}
