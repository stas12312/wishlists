import { Metadata } from "next";

import TelegramEntry from "@/components/auth/TelegramEntry";

export const metadata: Metadata = {
  title: "MyWishlists — Telegram",
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ link?: string }>;
}) {
  const params = await searchParams;
  return <TelegramEntry linkMode={params.link === "1"} />;
}
