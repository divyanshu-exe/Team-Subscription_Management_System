// OWNER: FE-1
// PURPOSE: Route protection and role-based redirects in Next.js Edge Middleware

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('sms_token')?.value;

  const adminRoutes = [
    '/dashboard',
    '/customers',
    '/products',
    '/plans',
    '/taxes',
    '/discounts',
    '/quotation-templates',
    '/subscriptions',
    '/invoices',
    '/payments',
    '/billing',
    '/staff',
  ];

  const portalRoutes = ['/my-subscriptions', '/my-invoices'];
  const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];

  const isAdminRoute = adminRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isPortalRoute = portalRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  // If visiting protected route with no token, redirect to /login
  if ((isAdminRoute || isPortalRoute) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    const payload = decodeJwtPayload(token);

    // If token invalid, clear and redirect to login
    if (!payload || !payload.role) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('sms_token');
      return response;
    }

    // Role checks
    const role = payload.role;

    // CUSTOMER trying to access admin route -> redirect to /my-subscriptions
    if (isAdminRoute && role === 'CUSTOMER') {
      return NextResponse.redirect(new URL('/my-subscriptions', request.url));
    }

    // ADMIN or STAFF trying to access portal route -> redirect to /dashboard
    if (isPortalRoute && (role === 'ADMIN' || role === 'STAFF')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If already logged in and visiting an auth route, redirect to workspace
    if (isAuthRoute) {
      const target = role === 'CUSTOMER' ? '/my-subscriptions' : '/dashboard';
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
