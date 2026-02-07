import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabaseServer';
import { extractUserFromToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Check for authorization token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Bookings POST: Missing or invalid authorization header');
      return NextResponse.json(
        { message: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }

    // Extract token and user
    const token = authHeader.split(' ')[1];
    console.log('Bookings POST: Attempting to verify token');
    const userData = extractUserFromToken(token);
    
    if (!userData || !userData.sub) {
      console.error('Bookings POST: Token verification failed or no user ID in token');
      return NextResponse.json(
        { message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }
    
    console.log('Bookings POST: Token verified successfully for user:', userData.sub);

    // Parse the request body
    const body = await request.json();
    console.log('Bookings POST: Request body:', JSON.stringify(body));
    
    // Support both camelCase and snake_case field names
    const serviceId = body.serviceId || body.service_id;
    const startDate = body.startDate || body.start_date;
    const endDate = body.endDate || body.end_date;
    const numberOfGuests = body.numberOfGuests || body.number_of_guests;
    const specialRequests = body.specialRequests || body.special_requests;
    const totalPrice = body.totalPrice || body.total_price;

    // Validate required fields
    if (!serviceId || !startDate) {
      console.error('Bookings POST: Missing required fields. serviceId:', serviceId, 'startDate:', startDate);
      return NextResponse.json(
        { message: 'Missing required fields: serviceId and startDate are required' },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabaseAdmin = getSupabaseAdmin();

    // Check if the service exists
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    // Get the service provider ID
    const providerId = service.provider_id;
    if (!providerId) {
      return NextResponse.json(
        { message: 'Service provider not found' },
        { status: 400 }
      );
    }

    // Create a new booking
    const { data: newBooking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        service_id: serviceId,
        customer_id: userData.sub,
        provider_id: providerId,
        status: 'pending',
        start_date: startDate,
        end_date: endDate || null,
        number_of_guests: numberOfGuests || 1,
        total_price: totalPrice,
        special_requests: specialRequests || null,
      })
      .select('*, service:service_id(id, title, price, price_type, images, provider_id), customer:customer_id(id, first_name, last_name, email)')
      .single();

    if (bookingError) throw bookingError;

    // Transform response to match client interface
    const transformedBooking = {
      _id: newBooking.id,
      service: newBooking.service ? {
        _id: newBooking.service.id,
        title: newBooking.service.title,
        price: newBooking.service.price,
        priceType: newBooking.service.price_type,
        images: newBooking.service.images || [],
        provider: newBooking.service.provider_id
      } : null,
      customer: newBooking.customer ? {
        _id: newBooking.customer.id,
        firstName: newBooking.customer.first_name,
        lastName: newBooking.customer.last_name,
        email: newBooking.customer.email
      } : null,
      status: newBooking.status,
      startDate: newBooking.start_date,
      endDate: newBooking.end_date,
      numberOfGuests: newBooking.number_of_guests,
      specialRequests: newBooking.special_requests,
      totalPrice: newBooking.total_price,
      providerNotes: newBooking.notes,
      createdAt: newBooking.created_at,
      updatedAt: newBooking.updated_at,
      provider_id: newBooking.provider_id
    };

    return NextResponse.json({
      message: 'Booking created successfully',
      booking: transformedBooking
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Error creating booking:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error creating booking';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = userData.role;

    console.log('User role from token:', role);
    console.log('User ID from token:', userData.sub);

    // Get Supabase client
    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin.from('bookings').select('*, service:service_id(id, title, price, price_type, images, provider_id), customer:customer_id(id, first_name, last_name, email)');

    // Filter bookings based on user role
    if (role === 'customer') {
      query = query.eq('customer_id', userData.sub);
    } else if (role === 'service_provider') {
      // For providers, find bookings for their services
      const { data: services, error: servicesError } = await supabaseAdmin
        .from('services')
        .select('id')
        .eq('provider_id', userData.sub);

      if (servicesError || !services || services.length === 0) {
        return NextResponse.json({ bookings: [] });
      }

      const serviceIds = services.map((s: any) => s.id);
      query = query.in('service_id', serviceIds);
    } else if (role !== 'admin') {
      // If not admin, customer, or provider, deny access
      console.log('Forbidden - User role is neither customer, service_provider, nor admin:', role);
      return NextResponse.json(
        { message: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Fetch bookings
    const { data: bookings, error: bookingsError } = await query.order('created_at', { ascending: false });

    if (bookingsError) throw bookingsError;

    // Transform bookings to match client interface
    const transformedBookings = (bookings || []).map((booking: any) => ({
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
    }));

    return NextResponse.json({
      bookings: transformedBookings
    });

  } catch (error: unknown) {
    console.error('Error fetching bookings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error fetching bookings';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
} 