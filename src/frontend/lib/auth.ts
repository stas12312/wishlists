"use server";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ITokens } from "./models/auth";
import { refreshTokens } from "./server-requests/auth";
import { IToken } from "./models/token";

const MAX_AGE = 60 * 60 * 24 * 30;

export async function refreshTokenIfNeed(): Promise<string | null> {
  const cookie = await cookies();

  const accessToken: string | undefined = cookie.get("access_token")?.value;
  const refreshTokenValue: string | undefined =
    cookie.get("refresh_token")?.value;
  if (accessToken) {
    const tokenData = jwtDecode(accessToken);
    const expiredTime = tokenData.exp;
    if (expiredTime && expiredTime * 1000 < Date.now()) {
      return await refreshToken();
    }
  }
  if (!accessToken && refreshTokenValue) {
    return await refreshToken();
  }
  return accessToken ?? null;
}

export async function getTokenData(token: string) {
  return jwtDecode(token);
}

export async function getUserFromCookies(): Promise<number | null> {
  const cookie = await cookies();
  const accessToken: string | undefined = cookie.get("access_token")?.value;
  if (accessToken) {
    const tokenData = jwtDecode<IToken>(accessToken);
    return tokenData["id"];
  }
  return null;
}

export async function logout() {
  const cookie = await cookies();

  cookie.delete("access_token");
  cookie.delete("refresh_token");
  redirect("/");
}

export async function setTokens(tokens: ITokens): Promise<string> {
  const cookie = await cookies();

  cookie.set("access_token", tokens.access_token, {
    maxAge: MAX_AGE,
    secure: true,
    httpOnly: true,
  });

  cookie.set("refresh_token", tokens.refresh_token, {
    maxAge: MAX_AGE,
    secure: true,
    httpOnly: true,
  });
  return tokens.access_token;
}

export async function refreshToken(): Promise<string> {
  const cookie = await cookies();
  const refreshToken = cookie.get("refresh_token")?.value;

  if (!refreshToken) {
    throw "Токен не найден";
  }
  const data = await refreshTokens(refreshToken);
  if ("message" in data) {
    throw "Некорректный ответ";
  }

  return await setTokens(data);
}
