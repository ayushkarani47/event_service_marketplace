import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== Send Email OTP Request Started ===');
    const body = await req.json();
    const { email } = body;

    console.log('Email received:', email);

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
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

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('Generated OTP:', otp);
    console.log('Attempting to insert into email_otp_verifications table...');

    // Store OTP in database
    const { error: dbError, data } = await supabase
      .from('email_otp_verifications')
      .insert([
        {
          email,
          otp_code: otp,
          expires_at: expiresAt.toISOString(),
          verified: false,
        },
      ]);

    if (dbError) {
      console.error('Database error:', JSON.stringify(dbError, null, 2));
      return NextResponse.json(
        { message: 'Failed to send OTP', error: dbError },
        { status: 500 }
      );
    }

    console.log('OTP inserted successfully:', data);

    // TODO: In production, integrate with email service (SendGrid, AWS SES, etc.)
    // For now, log the OTP
    console.log(`Email OTP for ${email}: ${otp}`);

    // Return success response
    return NextResponse.json(
      { 
        message: 'Email OTP sent successfully',
        // In development, return OTP for testing purposes
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Send Email OTP error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while sending OTP';
    console.error('Full error:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
