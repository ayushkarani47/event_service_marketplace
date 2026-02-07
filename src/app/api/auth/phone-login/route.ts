import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import * as jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { message: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP
    const { data: otpData, error: queryError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone', phone)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (queryError || !otpData) {
      return NextResponse.json(
        { message: 'No OTP found for this phone number' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    const expiresAt = new Date(otpData.expires_at);
    if (new Date() > expiresAt) {
      return NextResponse.json(
        { message: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (otpData.otp_code !== otp) {
      return NextResponse.json(
        { message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Get user by phone (don't use .single() to avoid errors)
    let { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone);

    let userData = users && users.length > 0 ? users[0] : null;

    // If user doesn't exist, create a minimal user record
    if (!userData) {
      console.log('User not found, creating minimal user record for phone:', phone);
      
      if (!supabaseAdmin) {
        console.error('Admin client not available - SUPABASE_SERVICE_ROLE_KEY not configured');
        return NextResponse.json(
          { message: 'Server configuration error' },
          { status: 500 }
        );
      }
      
      // Generate a UUID for the new user
      const userId = crypto.randomUUID();
      
      // Create minimal user record using admin client (bypasses RLS)
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert([
          {
            id: userId,
            phone,
            first_name: 'User',
            last_name: phone,
            email: `${phone}@temp.local`,
            role: 'customer',
            is_verified: true,
            rating: 0,
            review_count: 0,
          },
        ])
        .select()
        .single();

      if (createError) {
        // Check if it's a duplicate key error (user already exists)
        if (createError.code === '23505') {
          console.log('User already exists, fetching user data');
          // User already exists, fetch it
          const { data: existingUsers } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('phone', phone);
          
          if (existingUsers && existingUsers.length > 0) {
            userData = existingUsers[0];
          } else {
            console.error('Failed to fetch existing user:', createError);
            return NextResponse.json(
              { message: 'Failed to retrieve user account', error: createError.message },
              { status: 500 }
            );
          }
        } else {
          console.error('Failed to create user record:', createError);
          return NextResponse.json(
            { message: 'Failed to create user account', error: createError.message },
            { status: 500 }
          );
        }
      } else {
        userData = newUser;
      }
    } else if (userError) {
      // Other database errors
      console.error('User lookup error:', userError);
      console.error('Phone being searched:', phone);
      return NextResponse.json(
        { message: 'Database error', error: userError.message },
        { status: 500 }
      );
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', otpData.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { message: 'Failed to verify OTP' },
        { status: 500 }
      );
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }

    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
    
    const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
    const token = jwt.sign(
      {
        sub: userData.id,
        email: userData.email,
        role: userData.role,
        firstName: userData.first_name,
        lastName: userData.last_name,
      },
      JWT_SECRET,
      signOptions
    );

    // Return user data with token
    return NextResponse.json(
      {
        message: 'Login successful',
        token,
        user: {
          id: userData.id,
          phone: userData.phone,
          firstName: userData.first_name,
          lastName: userData.last_name,
          email: userData.email,
          role: userData.role,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Phone login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
