import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("auth_token")?.value;
  const isAuthenticated = Boolean(token);

  const authRoutes = ["/sign-in", "/sign-up"];
  const protectedPrefixes = ["/members", "/post-task", "/dashboard"];

  const isAuthPage = authRoutes.some((route) => pathname === route);
  
  // 1. Identify Protected Pages
  const isProtectedPage = protectedPrefixes.some((route) => pathname.startsWith(route));
  
  // 2. Identify Public Exception Paths
  // We include both potential paths: direct /businesses/ and dashboard-nested /dashboard/business/
  const isPublicBusinessDetail = 
    pathname.startsWith('/businesses/') || 
    pathname.startsWith('/dashboard/business/');

  // Redirect authenticated users away from login pages
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Logic: Redirect to login ONLY if:
  // - User is NOT authenticated
  // - The page IS in the protected list
  // - AND it is NOT a public business detail page
  if (!isAuthenticated && isProtectedPage && !isPublicBusinessDetail) {
    const loginUrl = new URL("/sign-in", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return response;
  }

  return NextResponse.next();
}