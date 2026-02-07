import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import { extractUserFromToken } from '@/lib/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const userData = extractUserFromToken(token);
    
    if (!userData || !userData.sub) {
      return NextResponse.json(
        { message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get Supabase client
    const supabaseAdmin = getSupabaseAdmin();

    // Fetch the booking with related data
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*, service:service_id(id, title, price, price_type, images, provider_id), customer:customer_id(id, first_name, last_name, email), provider:provider_id(id, first_name, last_name, email)')
      .eq('id', id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if the user has permission to view this booking
    const customerId = booking.customer_id;
    const providerId = booking.provider_id;
    
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

    // Transform response to match client interface
    const transformedBooking = {
      _id: booking.id,
      service: booking.service ? {
        _id: booking.service.id,
        title: booking.service.title,
        price: booking.service.price,
        priceType: booking.service.price_type,
        images: booking.service.images || [],
        provider: booking.service.provider_id
      } : null,
      customer: booking.customer ? {
        _id: booking.customer.id,
        firstName: booking.customer.first_name,
        lastName: booking.customer.last_name,
        email: booking.customer.email
      } : null,
      status: booking.status,
      startDate: booking.start_date,
      endDate: booking.end_date,
      numberOfGuests: booking.number_of_guests,
      specialRequests: booking.special_requests,
      totalPrice: booking.total_price,
      providerNotes: booking.notes,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      provider_id: booking.provider_id
    };

    return NextResponse.json({
      booking: transformedBooking
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const userData = extractUserFromToken(token);
    
    if (!userData || !userData.sub) {
      return NextResponse.json(
        { message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get Supabase client
    const supabaseAdmin = getSupabaseAdmin();

    // Fetch the booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (bookingError || !booking) {
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
    const customerId = booking.customer_id;
    const providerId = booking.provider_id;
    
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
      updateData.notes = providerNotes;
    }

    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select('*, service:service_id(id, title, price, price_type, images, provider_id), customer:customer_id(id, first_name, last_name, email)')
      .single();

    if (updateError) throw updateError;

    // Transform response to match client interface
    const transformedBooking = {
      _id: updatedBooking.id,
      service: updatedBooking.service ? {
        _id: updatedBooking.service.id,
        title: updatedBooking.service.title,
        price: updatedBooking.service.price,
        priceType: updatedBooking.service.price_type,
        images: updatedBooking.service.images || [],
        provider: updatedBooking.service.provider_id
      } : null,
      customer: updatedBooking.customer ? {
        _id: updatedBooking.customer.id,
        firstName: updatedBooking.customer.first_name,
        lastName: updatedBooking.customer.last_name,
        email: updatedBooking.customer.email
      } : null,
      status: updatedBooking.status,
      startDate: updatedBooking.start_date,
      endDate: updatedBooking.end_date,
      numberOfGuests: updatedBooking.number_of_guests,
      specialRequests: updatedBooking.special_requests,
      totalPrice: updatedBooking.total_price,
      providerNotes: updatedBooking.notes,
      createdAt: updatedBooking.created_at,
      updatedAt: updatedBooking.updated_at,
      provider_id: updatedBooking.provider_id
    };

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: transformedBooking
    });

  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { message: error.message || 'Error updating booking' },
      { status: 500 }
    );
  }
} 