import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear the cookie on the server
    response.cookies.set('sb-auth-token', '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });

    return response;
}
