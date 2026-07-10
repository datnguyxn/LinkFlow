import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const guestRoutes = [
  "/",
  "/login",
  "/register"
];

const protectedRoutes = [
  "/dashboard",
  "/workspace",
  "/settings",
  "/analytics",
];

function isGuestRoute(pathname: string) {
  return guestRoutes.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(route);
  });
}

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
}

export function middleware(
  request: NextRequest,
) {
  const token =
    request.cookies.get("refreshToken")?.value;

  const pathname =
    request.nextUrl.pathname;

  const isGuest =
    isGuestRoute(pathname);

  const isProtected =
    isProtectedRoute(pathname);

  if (token && isGuest) {
    return NextResponse.redirect(
      new URL(
        "/dashboard",
        request.url,
      ),
    );
  }

  if (!token && isProtected) {
    return NextResponse.redirect(
      new URL(
        "/login",
        request.url,
      ),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/workspace/:path*",
    "/settings/:path*",
    "/analytics/:path*",
  ],
};