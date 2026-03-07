// ============================================================
// proxy.ts
// Route protection and authentication proxy (formerly middleware.ts)
// ============================================================

import { type NextRequest, NextResponse } from 'next/server';

// Routes that are ALWAYS public (no auth required)
const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password'];

// File extensions that should never be intercepted by the proxy
const STATIC_EXTENSIONS = [
    '.js', '.css', '.map', '.json', '.xml',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.avif',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    '.mp4', '.webm', '.mp3', '.wav',
    '.pdf', '.txt', '.html',
];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    console.log(`[${new Date().toISOString()}] [Proxy] Processing: ${pathname}`);

    // ── Skip static assets completely ──
    // Check if the pathname ends with a known static extension
    const hasStaticExt = STATIC_EXTENSIONS.some(ext => pathname.endsWith(ext));
    if (hasStaticExt) {
        return NextResponse.next();
    }

    // Also skip known Next.js internal paths and public directory paths
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/maps/') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // ── Check authentication ──
    // ONLY check our explicitly-managed cookie, NOT Supabase's internal chunked cookies
    // Supabase sets its own cookies (sb-<project>-auth-token.0, .1, etc.) which persist
    // independently of actual session validity. We only trust our synced cookie.
    const authCookie = request.cookies.get('sb-auth-token');
    const isAuthenticated = !!authCookie?.value;
    console.log(`[Proxy] Auth check: sb-auth-token=${!!authCookie}, isAuthenticated=${isAuthenticated}`);

    // ── Public paths ──
    const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

    if (isPublicPath) {
        if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // ── Legacy redirect ──
    if (pathname === '/feed') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // ── Protect all dashboard routes ──
    if (!isAuthenticated) {
        console.log(`[${new Date().toISOString()}] [Proxy] [DENIED] Protected route: ${pathname}, isAuthenticated: ${isAuthenticated}. Redirecting to /login`);
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    console.log(`[${new Date().toISOString()}] [Proxy] [ALLOWED] Path: ${pathname}, isAuthenticated: ${isAuthenticated}`);
    return NextResponse.next();
}

export const config = {
    // Keep matcher broad — the function body handles filtering
    matcher: ['/((?!_next/static|_next/image).*)'],
};
