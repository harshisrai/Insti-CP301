import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const response = NextResponse.json({ success: true });

    // Clear our managed auth cookie
    response.cookies.set('sb-auth-token', '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });

    // Also clear any Supabase internal chunked cookies to prevent stale cookies
    // from interfering. These have the format: sb-<project>-auth-token.0, .1, etc.
    const allCookies = request.cookies.getAll();
    for (const cookie of allCookies) {
        if (cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')) {
            response.cookies.set(cookie.name, '', {
                path: '/',
                maxAge: 0,
                expires: new Date(0),
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            });
        }
    }

    return response;
}
