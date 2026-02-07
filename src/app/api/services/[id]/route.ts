import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabaseServer';
import { extractUserFromToken } from '@/lib/jwt';

// Get a single service by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await getSupabaseServer();
    
    // Fetch service from Supabase
    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ service }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while fetching the service' },
      { status: 500 }
    );
  }
}

// Update a service
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.split(' ')[1];
    const decodedToken = extractUserFromToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Fetch the service to check ownership
    const { data: service, error: fetchError } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the service or an admin
    if (
      service.provider_id !== decodedToken.sub && 
      decodedToken.role !== 'admin'
    ) {
      return NextResponse.json(
        { message: 'Unauthorized - You can only update your own services' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    
    // Update the service
    const { data: updatedService, error: updateError } = await supabaseAdmin
      .from('services')
      .update(body)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(
      { message: 'Service updated successfully', service: updatedService },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while updating the service' },
      { status: 500 }
    );
  }
}

// Delete a service
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.split(' ')[1];
    const decodedToken = extractUserFromToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Fetch the service to check ownership
    const { data: service, error: fetchError } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the service or an admin
    if (
      service.provider_id !== decodedToken.sub && 
      decodedToken.role !== 'admin'
    ) {
      return NextResponse.json(
        { message: 'Unauthorized - You can only delete your own services' },
        { status: 403 }
      );
    }

    // Delete the service
    const { error: deleteError } = await supabaseAdmin
      .from('services')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json(
      { message: 'Service deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while deleting the service' },
      { status: 500 }
    );
  }
} 