import axios from "axios";

import { ITokens } from "../models/auth";
import { authManager } from "../clientAuth";

type TelegramAuth = { linked: false } | ({ linked: true } & ITokens);

const telegramAxios = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/telegram`,
  withCredentials: true,
  timeout: 15000,
});

export async function authenticateTelegram(initData: string) {
  const response = await telegramAxios.post<TelegramAuth>("/", {
    init_data: initData,
  });
  return response.data;
}

export async function registerTelegram(initData: string) {
  const response = await telegramAxios.post<{ linked: true } & ITokens>(
    "/register",
    { init_data: initData },
  );
  return response.data;
}

export async function linkTelegram(initData: string) {
  const accessToken = await authManager.getAccessToken();
  if (!accessToken) {
    throw new Error("Войдите в аккаунт, чтобы привязать Telegram");
  }
  await telegramAxios.post(
    "/link",
    { init_data: initData },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
}
