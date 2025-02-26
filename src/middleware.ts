import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/firebase/config';

export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ['/', '/login'];
  const path = request.nextUrl.pathname;

  // Check if the path is public
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  // Get the token from the cookies
  const token = request.cookies.get('token');

  // If there's no token and the path is not public, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
} 