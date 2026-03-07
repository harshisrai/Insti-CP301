import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { access_token } = await request.json();

        if (!access_token) {
            return NextResponse.json({ error: 'Missing token' }, { status: 400 });
        }

        const response = NextResponse.json({ success: true });

        // Set the cookie securely on the server
        response.cookies.set('sb-auth-token', access_token, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: false, // Must be accessible occasionally depending on middleware setup
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
