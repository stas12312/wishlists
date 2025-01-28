import { NextRequest } from "next/server";

import { getOgImage } from "@/components/ogImage";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get("title") || "";
  const description = searchParams.get("description") || "";
  const footer = searchParams.get("footer") || "";
  return getOgImage(title, description, footer);
}
