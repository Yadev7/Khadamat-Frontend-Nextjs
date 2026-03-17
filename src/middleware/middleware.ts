import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Get the cookie
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const accessToken = request.cookies.get("accessToken")?.value;

  // --- DEBUG LOGS (Check your terminal, not the browser) ---
  console.log(`--- Middleware Check: ${pathname} ---`);
  console.log(`Refresh Token: ${refreshToken ? "FOUND" : "MISSING"}`);
  console.log(`Access Token: ${accessToken ? "FOUND" : "MISSING"}`);

  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";
  const isProtectedPage = pathname.startsWith("/members") || pathname.startsWith("/post-task");

  // Logic A: If logged in and trying to access Sign-In -> Send to /members
  if ((refreshToken || accessToken) && isAuthPage) {
    console.log("Redirecting to /members because user is logged in.");
    return NextResponse.redirect(new URL("/members", request.url));
  }

  // Logic B: If NOT logged in and trying to access Protected Page -> Send to /sign-in
  if (!refreshToken && !accessToken && isProtectedPage) {
    console.log("Blocking access. Redirecting to /sign-in.");
return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/members/:path*", "/post-task/:path*", "/sign-in", "/sign-up"],
};