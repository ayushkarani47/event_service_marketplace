import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import twilio from 'twilio';

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== Send OTP Request Started ===');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    
    const body = await req.json();
    const { phone } = body;

    console.log('Phone received:', phone);

    if (!phone) {
      return NextResponse.json(
        { message: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('Generated OTP:', otp);
    console.log('Attempting to insert into otp_verifications table...');

    // Store OTP in database
    const { error: dbError, data } = await supabase
      .from('otp_verifications')
      .insert([
        {
          phone,
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

    // Send OTP via SMS using Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `Your OTP is: ${otp}. Valid for 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
        console.log(`OTP sent via SMS to ${phone}`);
      } catch (smsError) {
        console.error('SMS sending error:', smsError);
        // Don't fail the request if SMS fails, log it for debugging
      }
    } else {
      // Development mode: log OTP to console
      console.log(`OTP for ${phone}: ${otp}`);
    }

    // Return success response
    return NextResponse.json(
      { 
        message: 'OTP sent successfully',
        // In development, return OTP for testing purposes
        otp: process.env.NODE_ENV === 'development' && !process.env.TWILIO_ACCOUNT_SID ? otp : undefined,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Send OTP error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while sending OTP';
    console.error('Full error:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
