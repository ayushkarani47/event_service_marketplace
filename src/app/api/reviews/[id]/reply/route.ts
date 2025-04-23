import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromToken } from '@/lib/jwt';
import { addReviewReply } from '@/lib/api/reviewService';

// PUT /api/reviews/:id/reply - Add a reply to a review
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    
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

    // Add reply to review
    const review = await addReviewReply(reviewId, body.reply, {
      _id: user.sub,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    console.error('Error adding reply to review:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Failed to add reply to review',
        error: error.toString()
      },
      { status: error.statusCode || 500 }
    );
  }
}
