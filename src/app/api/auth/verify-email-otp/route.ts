import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    console.log('=== Verify Email OTP Request Started ===');
    const body = await req.json();
    const { email, otp } = body;

    console.log('Email:', email);
    console.log('OTP:', otp);

    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Get the latest OTP for this email
    console.log('Querying OTP from database...');
    const { data: otpData, error: queryError } = await supabase
      .from('email_otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log('Query error:', queryError);
    console.log('OTP data:', otpData);

    if (queryError || !otpData) {
      console.error('Query error details:', JSON.stringify(queryError, null, 2));
      return NextResponse.json(
        { message: 'No OTP found for this email', error: queryError },
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

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from('email_otp_verifications')
      .update({ verified: true })
      .eq('id', otpData.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { message: 'Failed to verify OTP' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Email OTP verified successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Verify Email OTP error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while verifying OTP';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
