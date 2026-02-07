import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, firstName, lastName, email, role } = body;

    console.log('=== Complete Phone Registration Started ===');
    console.log('Phone:', phone);
    console.log('Email:', email);

    if (!phone || !firstName || !lastName || !email || !role) {
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

    // Check if phone is already registered
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (!checkError && existingUser) {
      return NextResponse.json(
        { message: 'Phone number already registered' },
        { status: 409 }
      );
    }

    // Create Supabase auth user with email
    console.log('Creating Supabase auth user...');
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { message: 'Admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY in environment variables.' },
        { status: 500 }
      );
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      phone,
      email_confirm: true, // Auto-confirm email since we verified OTP
      phone_confirm: true, // Auto-confirm phone since we verified OTP
      user_metadata: {
        firstName,
        lastName,
        role,
      },
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return NextResponse.json(
        { message: authError.message || 'Failed to create auth user' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { message: 'Failed to create user account' },
        { status: 500 }
      );
    }

    console.log('Auth user created:', authData.user.id);

    // Create user profile in users table using admin client (bypasses RLS)
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: authData.user.id,
          phone,
          first_name: firstName,
          last_name: lastName,
          email,
          role,
          is_verified: true,
          rating: 0,
          review_count: 0,
        },
      ]);

    if (userError) {
      console.error('User creation error:', userError);
      // Try to delete the auth user if profile creation fails
      if (supabaseAdmin) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      }
      return NextResponse.json(
        { message: 'Failed to create user profile', error: userError },
        { status: 500 }
      );
    }

    console.log('User profile created successfully');

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: authData.user.id,
          phone,
          firstName,
          lastName,
          email,
          role,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Complete registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
