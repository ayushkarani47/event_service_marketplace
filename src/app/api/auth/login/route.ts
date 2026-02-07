import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import { generateToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { email, password } = body;

    // Check if email and password are provided
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Find the user by email
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email);

    // Check if user exists
    if (userError || !users || users.length === 0) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Note: Supabase handles password authentication via Auth API
    // For email/password login, use Supabase Auth instead
    // This endpoint is kept for backward compatibility but recommends using phone-based auth
    
    // Generate JWT token using user data
    const token = generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name
    });

    // Prepare user data for response
    const userResponse = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
    };

    // Return success response with token and user data
    return NextResponse.json(
      {
        message: 'Login successful',
        user: userResponse,
        token,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}