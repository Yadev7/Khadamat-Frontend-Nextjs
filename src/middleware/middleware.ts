// import { NextRequest, NextResponse } from "next/server";

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   const token = request.cookies.get("auth_token")?.value;
//   const isAuthenticated = Boolean(token);

//   const authRoutes = ["/sign-in", "/sign-up"];
//   const protectedPrefixes = ["/members", "/post-task", "/dashboard"];

//   const isAuthPage = authRoutes.some((route) => pathname === route);
  

//   const isProtectedPage = protectedPrefixes.some((route) => pathname.startsWith(route));
  

//   const isPublicBusinessDetail = 
//     pathname.startsWith('/businesses/') || 
//     pathname.startsWith('/dashboard/business/');

//   if (isAuthenticated && isAuthPage) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }


//   if (!isAuthenticated && isProtectedPage && !isPublicBusinessDetail) {
//     const loginUrl = new URL("/sign-in", request.url);
//     loginUrl.searchParams.set("callbackUrl", pathname);
    
//     const response = NextResponse.redirect(loginUrl);
//     response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
//     return response;
//   }

//   return NextResponse.next();
// }


// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("auth_token")?.value;
  const isAuthenticated = Boolean(token);

  const authRoutes = ["/sign-in", "/sign-up"];
  const protectedPrefixes = ["/members", "/post-task", "/dashboard"];

  const isAuthPage = authRoutes.some((route) => pathname === route);
  const isProtectedPage = protectedPrefixes.some((route) => pathname.startsWith(route));
  
  const isPublicBusinessDetail = 
    pathname.startsWith('/businesses/') || 
    pathname.startsWith('/dashboard/business/');

  // تمرير الهيدر للمكونات التي تعمل Server-side
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-current-path', pathname);

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAuthenticated && isProtectedPage && !isPublicBusinessDetail) {
    const loginUrl = new URL("/sign-in", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return response;
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};