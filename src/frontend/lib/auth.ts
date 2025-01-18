"use server";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ITokens } from "./models";
import { refreshTokens } from "./requests";
import { IToken } from "./models/token";

const MAX_AGE = 60 * 60 * 24 * 30;

export async function refreshTokenIfNeed(): Promise<string | null> {
  const cookie = await cookies();

  const accessToken: string | undefined = cookie.get("access_token")?.value;
  if (accessToken) {
    const tokenData = jwtDecode(accessToken);
    const expiredTime = tokenData.exp;
    if (expiredTime && expiredTime * 1000 < Date.now()) {
      console.log("Обновление токена");
      return await refreshToken();
    }
  }
  return null;
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

  cookie.set("access_token", tokens.access_token, { maxAge: MAX_AGE });
  cookie.set("refresh_token", tokens.refresh_token, { maxAge: MAX_AGE });
  return tokens.access_token;
}

async function refreshToken(): Promise<string> {
  const cookie = await cookies();
  const refreshToken = cookie.get("refresh_token")?.value;

  if (!refreshToken) {
    throw "Токен не найден";
  }
  const response = await refreshTokens(refreshToken);

  if ("message" in response) {
    throw "Некорректный ответ";
  }

  return await setTokens(response);
}
