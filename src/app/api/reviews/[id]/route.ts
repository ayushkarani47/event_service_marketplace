import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromToken } from '@/lib/jwt';
import { updateReview, deleteReview, addReviewReply, getReviewById } from '@/lib/api/reviewService';

// GET /api/reviews/:id - Get a specific review
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    
    // Get review
    const review = await getReviewById(reviewId);
    if (!review) {
      return NextResponse.json(
        { message: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Failed to fetch review',
        error: error.toString()
      },
      { status: error.statusCode || 500 }
    );
  }
}

// PUT /api/reviews/:id - Update a review
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

    // Update review
    const review = await updateReview(reviewId, body, {
      _id: user.sub,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Failed to update review',
        error: error.toString()
      },
      { status: error.statusCode || 500 }
    );
  }
}

// DELETE /api/reviews/:id - Delete a review
export async function DELETE(
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

    // Delete review
    await deleteReview(reviewId, {
      _id: user.sub,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Failed to delete review',
        error: error.toString()
      },
      { status: error.statusCode || 500 }
    );
  }
}
