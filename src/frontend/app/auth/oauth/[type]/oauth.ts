"use server";
import { setTokens } from "@/lib/auth";
import { OAuth } from "@/lib/server-requests/auth";

export async function login(oauth_type: string, token: string) {
  const tokens = await OAuth(oauth_type.toUpperCase(), token);
  if ("message" in tokens) {
    return { message: tokens.message };
  }

  await setTokens(tokens);
}
