import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET bookings for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role'); // 'customer' or 'provider'

    if (!userId) {
      return NextResponse.json(
        { message: 'userId is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('bookings')
      .select('*, services(id, title, price, images), customer:customer_id(id, first_name, last_name, phone), provider:provider_id(id, first_name, last_name, phone)');

    if (role === 'customer') {
      query = query.eq('customer_id', userId);
    } else if (role === 'provider') {
      query = query.eq('provider_id', userId);
    }

    const { data: bookings, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { message: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { bookings: bookings || [] },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Get bookings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching bookings';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

// POST create a new booking
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, customerId, providerId, bookingDate, eventDate, totalPrice, notes } = body;

    if (!serviceId || !customerId || !providerId || !bookingDate || !eventDate || !totalPrice) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify service exists
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          service_id: serviceId,
          customer_id: customerId,
          provider_id: providerId,
          booking_date: new Date().toISOString(),
          event_date: eventDate,
          total_price: totalPrice,
          notes: notes || null,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return NextResponse.json(
        { message: 'Failed to create booking' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Booking created successfully', booking },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Create booking error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating booking';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
