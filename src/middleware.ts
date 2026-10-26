import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('auth_token')?.value;
  const refreshToken = request.cookies.get('auth_refresh_token')?.value;
  const isAuthenticated = Boolean(accessToken || refreshToken);

  const protectedPrefixes = ['/members', '/post-task', '/dashboard', '/admin'];

  const isProtectedPage = protectedPrefixes.some((route) =>
    pathname.startsWith(route),
  );

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // If the page is protected and the user lacks tokens, redirect to sign-in
  if (!isAuthenticated && isProtectedPage) {
    const loginUrl = new URL('/sign-in', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);

    const response = NextResponse.redirect(loginUrl);
    response.headers.set(
      'Cache-Control',
      'no-store, max-age=0, must-revalidate',
    );
    return response;
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};