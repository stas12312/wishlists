import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import {refreshTokenIfNeed} from './lib/auth'
 
export default async function middleware(request: NextRequest) {
    const cookieStore = await cookies()
    if (!cookieStore.get("access_token")?.value || !cookieStore.get("refresh_token")?.value) {
      cookieStore.delete("access_token")
      cookieStore.delete("refresh_token")
      return NextResponse.redirect(new URL('/login', request.url))
      
    }
    await refreshTokenIfNeed()
    return NextResponse.next()
  }
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|login|register|wishlists|restore-password).*)',
}