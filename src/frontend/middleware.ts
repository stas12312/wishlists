import { NextRequest, NextResponse } from "next/server";

import { refreshTokenIfNeed } from "./lib/auth";

export default async function middleware(request: NextRequest) {
  if (
    (!request.cookies.has("access_token") ||
      !request.cookies.has("refresh_token")) &&
    !request.nextUrl.pathname.startsWith("/wishlists") &&
    !request.nextUrl.pathname.startsWith("/users") &&
    request.nextUrl.pathname !== "/"
  ) {
    request.cookies.delete("access_token");
    request.cookies.delete("refresh_token");

    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  if (request.cookies.get("refresh_token")?.value) {
    try {
      const accessToken = await refreshTokenIfNeed();
      if (accessToken) {
        request.cookies.set("access_token", accessToken);
      }
    } catch {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next({
    request: request,
  });
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|auth|opengraph-image|static).*)",
  ],
};
