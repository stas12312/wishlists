import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

import { refreshTokenIfNeed } from "./lib/auth";

export default async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  if (
    (
      !cookieStore.get("access_token")?.value ||
    !cookieStore.get("refresh_token")?.value
  )
    && !request.nextUrl.pathname.startsWith("/wishlists")
    && !request.nextUrl.pathname.startsWith("/users")
    && (request.nextUrl.pathname !== "/")
  ) {
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  if (cookieStore.get("refresh_token")?.value) {
    await refreshTokenIfNeed();

  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|auth).*)",
  ],
};
