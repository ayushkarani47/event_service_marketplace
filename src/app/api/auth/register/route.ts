import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { firstName, lastName, email, password, role } = body;

    // Check if required fields are provided
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if the user already exists
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email);

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate a UUID for the new user
    const userId = crypto.randomUUID();

    // Create a new user
    const { data: user, error: createError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: userId,
          first_name: firstName,
          last_name: lastName,
          email,
          role: role || 'customer',
          is_verified: false,
          rating: 0,
          review_count: 0,
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error('User creation error:', createError);
      return NextResponse.json(
        { message: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Prepare user data for response
    const userResponse = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
    };

    return NextResponse.json(
      { message: 'User registered successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}