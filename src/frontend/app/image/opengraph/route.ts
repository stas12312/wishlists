import { NextRequest } from "next/server";

import { getOgImage } from "@/components/OGImage";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get("title") || "";
  const description = searchParams.get("description") || "";
  const footer = searchParams.get("footer") || "";
  const color = searchParams.get("color") || undefined;
  const emoji = searchParams.get("emoji") || undefined;
  const theme = searchParams.get("theme");
  return getOgImage(title, description, footer, {
    avatar: searchParams.get("avatar") || undefined,
    color,
    emoji,
    theme: theme === "dark" ? "dark" : "light",
  });
}
