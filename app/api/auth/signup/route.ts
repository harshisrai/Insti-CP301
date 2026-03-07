import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, password, role, department, batch } = body;

    // Validate required fields
    if (!full_name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Sign up with Supabase Auth
    const { data: authData, error: signUpError } = await db.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return NextResponse.json(
        { message: signUpError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { message: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create user profile using RPC
    const { error: profileError } = await db.rpc('create_user_profile', {
      p_id: authData.user.id,
      p_email: email,
      p_full_name: full_name,
      p_role: role,
      p_department: department || null,
      p_batch: batch || null,
    });

    if (profileError) {
      // Clean up auth user if profile creation fails
      console.error('[signup] Profile creation error:', profileError);
      return NextResponse.json(
        { message: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'User created successfully', userId: authData.user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('[signup] Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
