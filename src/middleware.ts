import { NextRequest, NextResponse } from 'next/server';

// Runs on the server before protected pages render, preventing flashes of
// protected content for unauthenticated users.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('auth_token')?.value;
  const refreshToken = request.cookies.get('auth_refresh_token')?.value;
  const isAuthenticated = Boolean(accessToken || refreshToken);

  const authRoutes = ['/sign-in', '/sign-up'];
  const protectedPrefixes = ['/members', '/post-task', '/dashboard', '/admin'];

  const isAuthPage = authRoutes.some((route) => pathname === route);
  const isProtectedPage = protectedPrefixes.some((route) =>
    pathname.startsWith(route),
  );

  // Business detail pages are publicly viewable.
  const isPublicBusinessDetail = pathname.startsWith('/dashboard/business/');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isAuthenticated && isProtectedPage && !isPublicBusinessDetail) {
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
