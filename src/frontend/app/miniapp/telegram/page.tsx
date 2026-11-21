import { Metadata } from "next";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

import TelegramEntry from "@/components/auth/TelegramEntry";
import { IToken } from "@/lib/models/token";

export const metadata: Metadata = {
  title: "MyWishlists — Telegram",
  robots: { index: false, follow: false },
};

function getReturnPath(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.startsWith("/")) return "/";

  const origin = "https://miniapp.invalid";
  const target = URL.parse(value, origin);
  if (
    !target ||
    target.origin !== origin ||
    target.pathname.startsWith("//") ||
    target.pathname.replace(/\/+$/, "") === "/miniapp/telegram"
  ) {
    return "/";
  }

  return target.pathname + target.search + target.hash;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    link?: string;
    link_code?: string;
    ret?: string | string[];
    tgWebAppStartParam?: string;
  }>;
}) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  const accessToken = cookieStore.get("access_token")?.value;
  let sessionUserId: number | undefined;
  if (accessToken && cookieStore.has("refresh_token")) {
    try {
      const { id, exp } = jwtDecode<IToken>(accessToken);
      if (exp * 1000 > Date.now()) sessionUserId = id;
    } catch {
      // Повреждённый токен пропускаем, чтобы Telegram мог создать новую сессию.
    }
  }
  return (
    <TelegramEntry
      linkMode={params.link === "1"}
      returnPath={getReturnPath(params.ret)}
      sessionUserId={sessionUserId}
    />
  );
}
