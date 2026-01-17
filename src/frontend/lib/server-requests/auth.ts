"use server";
import { IError } from "../models";
import { IOAuthProvider, ITokens } from "../models/auth";

import { serverAxios } from "./base";

export async function getOAuthProviders(): Promise<IOAuthProvider[]> {
  const response = await serverAxios.get("/auth/oauth/providers");
  return response.data.data;
}

export async function refreshTokens(
  refreshToken: string,
): Promise<ITokens | IError> {
  const response = await serverAxios.post("/auth/refresh", {
    refresh_token: refreshToken,
  });
  return response.data;
}
