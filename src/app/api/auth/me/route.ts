import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import { extractUserFromToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify and decode the token
    const decodedToken = extractUserFromToken(token);
    
    if (!decodedToken || !decodedToken.sub) {
      return NextResponse.json(
        { message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get Supabase admin client
    const supabaseAdmin = getSupabaseAdmin();

    // Find the user by ID
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, phone, first_name, last_name, email, role, profile_picture, bio, location, rating, review_count, is_verified, created_at, updated_at')
      .eq('id', decodedToken.sub)
      .single();
    
    if (error || !user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data
    return NextResponse.json(
      { user },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error fetching user:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
} 