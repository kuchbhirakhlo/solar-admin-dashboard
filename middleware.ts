import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const isLoginPage = request.nextUrl.pathname.startsWith('/auth/login');
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

  // If accessing login page and has session cookie, redirect to dashboard
  if (isLoginPage && sessionCookie?.value) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If accessing dashboard without session cookie, redirect to login
  if (isDashboardPage && !sessionCookie?.value) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/login/:path*', '/dashboard/:path*'],
};
