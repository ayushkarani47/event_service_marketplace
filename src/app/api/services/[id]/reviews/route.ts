import { NextRequest, NextResponse } from 'next/server';
import { getServiceReviews } from '@/lib/api/reviewService';

// GET /api/services/:id/reviews - Get reviews for a service
export async function GET(
  request: NextRequest,
  context: { params: { id?: string } }
) {
  try {
    // Check if id exists in params
    if (!context.params || !context.params.id) {
      return NextResponse.json(
        { message: 'Service ID is required' },
        { status: 400 }
      );
    }

    const serviceId = context.params.id;
    
    // Get reviews for service
    const reviews = await getServiceReviews(serviceId);

    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    console.error('Error fetching service reviews:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Failed to fetch reviews',
        error: error.toString()
      },
      { status: error.statusCode || 500 }
    );
  }
}
