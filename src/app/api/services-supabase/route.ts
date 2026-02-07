import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET all services or search
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    let query = supabase
      .from('services')
      .select('*, users(id, phone, first_name, last_name, profile_picture, rating)', { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { message: 'Failed to fetch services' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        services: data || [],
        total: count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Get services error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching services';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

// POST create a new service
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { providerId, title, description, category, price, images, location, availability, features } = body;

    if (!providerId || !title || !description || !category || !price || !location) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify provider exists
    const { data: provider, error: providerError } = await supabase
      .from('users')
      .select('id')
      .eq('id', providerId)
      .eq('role', 'service_provider')
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { message: 'Provider not found or not authorized' },
        { status: 404 }
      );
    }

    // Create service
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert([
        {
          provider_id: providerId,
          title,
          description,
          category,
          price,
          images: images || [],
          location,
          availability: availability || null,
          features: features || [],
          rating: 0,
          review_count: 0,
        },
      ])
      .select()
      .single();

    if (serviceError) {
      console.error('Service creation error:', serviceError);
      return NextResponse.json(
        { message: 'Failed to create service' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Service created successfully', service },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Create service error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating service';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
