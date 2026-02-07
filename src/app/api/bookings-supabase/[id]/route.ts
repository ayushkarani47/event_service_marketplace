import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET a single booking
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, services(id, title, price, images, category), customer:customer_id(id, first_name, last_name, phone, email), provider:provider_id(id, first_name, last_name, phone, email)')
      .eq('id', id)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { booking },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Get booking error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching booking';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

// UPDATE booking status
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, userId } = body;

    if (!status) {
      return NextResponse.json(
        { message: 'Status is required' },
        { status: 400 }
      );
    }

    // Verify booking exists and user is authorized
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('provider_id, customer_id')
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Only provider or customer can update booking
    if (booking.provider_id !== userId && booking.customer_id !== userId) {
      return NextResponse.json(
        { message: 'Not authorized to update this booking' },
        { status: 403 }
      );
    }

    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Booking update error:', updateError);
      return NextResponse.json(
        { message: 'Failed to update booking' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Booking updated successfully', booking: updatedBooking },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Update booking error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while updating booking';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE a booking
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { userId } = body;

    // Verify booking exists and user is authorized
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('customer_id')
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.customer_id !== userId) {
      return NextResponse.json(
        { message: 'Not authorized to delete this booking' },
        { status: 403 }
      );
    }

    // Delete booking
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Booking deletion error:', deleteError);
      return NextResponse.json(
        { message: 'Failed to delete booking' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Booking deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Delete booking error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting booking';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
