import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await connectDB();

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

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create a new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'customer',
    });

    // Remove password from response
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
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