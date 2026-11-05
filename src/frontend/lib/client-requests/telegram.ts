import axios from "axios";

import { ITokens } from "../models/auth";
import { IUser } from "../models/user";
import { authManager } from "../clientAuth";

type TelegramAuth = { linked: false } | ({ linked: true } & ITokens);
type TelegramInspection = { linked: false } | { linked: true; user: IUser };

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

export async function inspectTelegram(initData: string) {
  const response = await telegramAxios.post<TelegramInspection>("/inspect", {
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

export async function createTelegramLinkCode() {
  const accessToken = await authManager.getAccessToken();
  if (!accessToken) {
    throw new Error("Войдите в аккаунт, чтобы привязать Telegram");
  }
  const response = await telegramAxios.post<{
    url: string;
    expires_in: number;
  }>("/link-code", undefined, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}

let linkCodeExchange:
  | {
      code: string;
      initData: string;
      result: Promise<{ linked: true } & ITokens>;
    }
  | undefined;

export function redeemTelegramLinkCode(initData: string, code: string) {
  if (
    linkCodeExchange?.code === code &&
    linkCodeExchange.initData === initData
  ) {
    return linkCodeExchange.result;
  }
  // Перемонтирование экрана не должно повторно погашать одноразовый код.
  const exchange = {
    code,
    initData,
    result: telegramAxios
      .post<{ linked: true } & ITokens>("/link-code/redeem", {
        init_data: initData,
        code,
      })
      .then((response) => response.data),
  };
  linkCodeExchange = exchange;
  void exchange.result.catch(() => {
    if (linkCodeExchange === exchange) linkCodeExchange = undefined;
  });
  return exchange.result;
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

export async function unlinkTelegram(initData: string, expectedUserId: number) {
  const accessToken = await authManager.getAccessToken();
  if (!accessToken) {
    throw new Error("Войдите в аккаунт, чтобы продолжить привязку Telegram");
  }
  await telegramAxios.post(
    "/unlink",
    { init_data: initData, expected_user_id: expectedUserId },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
}

export async function logoutTelegram() {
  await telegramAxios.post(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/logout`,
  );
  linkCodeExchange = undefined;
}
