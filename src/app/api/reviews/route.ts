import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromToken } from '@/lib/jwt';
import { createReview, getCustomerReviews } from '@/lib/api/reviewService';

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    // Get token from request
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const user = extractUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();

    // Create review
    const review = await createReview(body, {
      _id: user.sub,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Failed to create review',
        error: error.toString()
      },
      { status: error.statusCode || 500 }
    );
  }
}

// GET /api/reviews/customer - Get reviews by customer
export async function GET(request: NextRequest) {
  try {
    // Get token from request
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const user = extractUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get reviews by customer
    const reviews = await getCustomerReviews(user.sub);

    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    console.error('Error fetching customer reviews:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Failed to fetch reviews',
        error: error.toString()
      },
      { status: error.statusCode || 500 }
    );
  }
}
