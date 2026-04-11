import { NextRequest, NextResponse } from "next/server";

// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // FIX: Match the cookie name used in your Axios/Services
  const token = request.cookies.get("auth_token")?.value;
  const isAuthenticated = Boolean(token);

  const authRoutes = ["/sign-in", "/sign-up"];
  const protectedPrefixes = ["/members", "/post-task", "/dashboard"];

  const isAuthPage = authRoutes.some((route) => pathname === route);
  const isProtectedPage = protectedPrefixes.some((route) => pathname.startsWith(route));

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAuthenticated && isProtectedPage) {
    const loginUrl = new URL("/sign-in", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    
    const response = NextResponse.redirect(loginUrl);
    // This tells the browser: "Do not show a cached version of this page"
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return response;
  }

  return NextResponse.next();
}