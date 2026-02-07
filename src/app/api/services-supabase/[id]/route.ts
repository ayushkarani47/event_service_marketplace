import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET a single service
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: service, error } = await supabase
      .from('services')
      .select('*, users(id, phone, first_name, last_name, profile_picture, rating, bio)')
      .eq('id', id)
      .single();

    if (error || !service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    // Get reviews for this service
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*, users(first_name, last_name, profile_picture)')
      .eq('service_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json(
      { service, reviews: reviews || [] },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Get service error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching service';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

// UPDATE a service
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { providerId, ...updateData } = body;

    // Verify ownership
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('provider_id')
      .eq('id', id)
      .single();

    if (fetchError || !service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    if (service.provider_id !== providerId) {
      return NextResponse.json(
        { message: 'Not authorized to update this service' },
        { status: 403 }
      );
    }

    // Update service
    const { data: updatedService, error: updateError } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Service update error:', updateError);
      return NextResponse.json(
        { message: 'Failed to update service' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Service updated successfully', service: updatedService },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Update service error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while updating service';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE a service
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { providerId } = body;

    // Verify ownership
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('provider_id')
      .eq('id', id)
      .single();

    if (fetchError || !service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    if (service.provider_id !== providerId) {
      return NextResponse.json(
        { message: 'Not authorized to delete this service' },
        { status: 403 }
      );
    }

    // Delete service
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Service deletion error:', deleteError);
      return NextResponse.json(
        { message: 'Failed to delete service' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Service deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Delete service error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting service';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
