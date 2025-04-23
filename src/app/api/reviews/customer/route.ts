import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromToken } from '@/lib/jwt';
import { getCustomerReviews } from '@/lib/api/reviewService';

// GET /api/reviews/customer - Get reviews by the current customer
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
    const reviews = await getCustomerReviews(user.sub); // Use sub as the user ID

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
