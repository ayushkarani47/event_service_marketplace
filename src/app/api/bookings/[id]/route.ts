import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import Service from '@/models/Service';
import User from '@/models/User';
import { extractUserFromToken } from '@/lib/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check for authorization token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }

    // Extract token and user
    const token = authHeader.split(' ')[1];
    const userData = await extractUserFromToken(token);
    
    if (!userData || !userData.sub) {
      return NextResponse.json(
        { message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Fetch the booking
    const booking = await Booking.findById(id)
      .populate('service', 'title price priceType images provider')
      .populate('customer', 'firstName lastName email');

    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if the user has permission to view this booking
    // Handle populated documents by safely accessing IDs with proper type handling
    let customerId = '';
    if (booking.customer) {
      // Handle both populated and non-populated cases
      customerId = 'firstName' in booking.customer 
        ? (booking.customer as unknown as { _id: { toString(): string } })._id.toString()
        : booking.customer.toString();
    }
    
    let providerId = '';
    if (booking.service) {
      // Handle both populated and non-populated cases for service
      const service = booking.service as unknown as { provider?: { toString(): string } | { _id: { toString(): string } } };
      if (service.provider) {
        providerId = 'toString' in service.provider 
          ? service.provider.toString()
          : (service.provider as { _id: { toString(): string } })._id.toString();
      }
    }
    
    const isCustomer = customerId === userData.sub;
    const isProvider = userData.role === 'service_provider' && providerId === userData.sub;
    const isAdmin = userData.role === 'admin';

    console.log('User ID from token:', userData.sub);
    console.log('User role from token:', userData.role);
    console.log('Customer ID from booking:', customerId);
    console.log('Provider ID from booking:', providerId);
    console.log('Permission check:', { isCustomer, isProvider, isAdmin });

    if (!isCustomer && !isProvider && !isAdmin) {
      return NextResponse.json(
        { message: 'Forbidden - You do not have permission to view this booking' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      booking
    });

  } catch (error: any) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check for authorization token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }

    // Extract token and user
    const token = authHeader.split(' ')[1];
    const userData = await extractUserFromToken(token);
    
    if (!userData || !userData.sub) {
      return NextResponse.json(
        { message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Fetch the booking
    const booking = await Booking.findById(id)
      .populate('service', 'provider');

    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status, providerNotes } = body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Check permissions for status update
    // Handle populated documents by safely accessing IDs with proper type handling
    let customerId = '';
    if (booking.customer) {
      // Handle both populated and non-populated cases
      customerId = 'firstName' in booking.customer 
        ? (booking.customer as unknown as { _id: { toString(): string } })._id.toString()
        : booking.customer.toString();
    }
    
    let providerId = '';
    if (booking.service) {
      // Handle both populated and non-populated cases for service
      const service = booking.service as unknown as { provider?: { toString(): string } | { _id: { toString(): string } } };
      if (service.provider) {
        providerId = 'toString' in service.provider 
          ? service.provider.toString()
          : (service.provider as { _id: { toString(): string } })._id.toString();
      }
    }
    
    const isCustomer = customerId === userData.sub;
    const isProvider = userData.role === 'service_provider' && providerId === userData.sub;
    const isAdmin = userData.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return NextResponse.json(
        { message: 'Forbidden - You do not have permission to update this booking' },
        { status: 403 }
      );
    }

    // Apply permission rules for specific status changes
    if (status) {
      // Customers can only cancel their own bookings
      if (isCustomer && status !== 'cancelled') {
        return NextResponse.json(
          { message: 'Customers can only cancel bookings, not change to other statuses' },
          { status: 403 }
        );
      }

      // Providers can confirm, reject, or mark as completed
      if (isProvider && !['confirmed', 'rejected', 'completed'].includes(status)) {
        return NextResponse.json(
          { message: 'Providers can only confirm, reject, or mark bookings as completed' },
          { status: 403 }
        );
      }
    }

    // Update the booking
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (providerNotes && (isProvider || isAdmin)) {
      updateData.providerNotes = providerNotes;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('service', 'title price priceType images')
      .populate('customer', 'firstName lastName email');

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    });

  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { message: error.message || 'Error updating booking' },
      { status: 500 }
    );
  }
} 