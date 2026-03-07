import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mapUser } from '@/lib/db/users';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign in with Supabase Auth
    const { data: authData, error: signInError } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { message: signInError.message },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { message: 'Login failed' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await db
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('[login] Profile fetch error:', profileError);
    }

    return NextResponse.json({
      message: 'Login successful',
      user: userProfile ? mapUser(userProfile) : null,
      session: authData.session,
    });
  } catch (error) {
    console.error('[login] Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
