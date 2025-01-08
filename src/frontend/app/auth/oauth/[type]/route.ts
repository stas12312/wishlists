import { NextRequest } from "next/server";

import { setTokens } from "@/lib/auth";
import { OAuth } from "@/lib/requests";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) => {
  const oauth_type = (await params).type;
  const token = request.nextUrl.searchParams.get("code") ?? "";

  const tokens = await OAuth(oauth_type.toUpperCase(), token);
  if ("message" in tokens) {
    return Response.json({ message: tokens.message });
  }

  await setTokens(tokens);
};
