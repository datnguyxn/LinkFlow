import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { ROUTES, PUBLIC_ROUTES, isPublicRoute, isProtectedRoute } from '@/constants/routes';

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')?.value;

  const { pathname } = request.nextUrl;

  if (refreshToken && isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  if (!refreshToken && isProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/forgot-password/success',
    '/reset-password',
    '/reset-password/success',
    '/verify-email',
    '/register/success',

    '/dashboard/:path*',
    '/workspace/:path*',
    '/settings/:path*',
    '/analytics/:path*',
  ],
};
