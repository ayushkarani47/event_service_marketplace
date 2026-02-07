import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabaseServer';
import { extractUserFromToken } from '@/lib/jwt';

// Helper to build dynamic filters for Postgres query
const buildFilter = (params: URLSearchParams) => {
  const filters: Record<string, any> = {};
  if (params.get('category')) filters.category = params.get('category');
  if (params.get('minPrice')) filters.price = { gte: Number(params.get('minPrice')) };
  if (params.get('maxPrice')) filters.price = { ...filters.price, lte: Number(params.get('maxPrice')) };
  if (params.get('minRating')) filters.rating = { gte: Number(params.get('minRating')) };
  if (params.get('location')) filters.location = params.get('location');
  return filters;
};

// Get all services or filter by query params
export async function GET(req: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const url = new URL(req.url);
    const search = url.searchParams.get('search');
    const provider = url.searchParams.get('provider');

    let query = supabase.from('services').select('*');

    // Filter by provider if specified
    if (provider) {
      query = query.eq('provider_id', provider);
    }

    // text search (simple ilike on title/desc)
    if (search) {
      query = query.or(`title.ilike.%₹{search}%,description.ilike.%₹{search}%`);
    }

    const filters = buildFilter(url.searchParams);
    for (const key in filters) {
      const val = filters[key];
      if (typeof val === 'object' && val.gte !== undefined)
        query = query.gte(key, val.gte);
      if (typeof val === 'object' && val.lte !== undefined)
        query = query.lte(key, val.lte);
      if (typeof val !== 'object') query = query.eq(key, val);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json({ services: data }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while fetching services' },
      { status: 500 }
    );
  }
}

// Create a new service
export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await getSupabaseServer();
    const supabaseAdmin = getSupabaseAdmin();

    // Try to get Supabase session first
    let userId: string | null = null;
    let userRole: string | null = null;
    let useAdmin = false;

    const {
      data: { session },
      error: sessErr,
    } = await supabaseServer.auth.getSession();

    if (session) {
      // Supabase session exists
      userId = session.user.id;
      userRole = session.user.user_metadata?.role as string;
    } else {
      // Try JWT token from Authorization header
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.split(' ')[1];
      const decodedToken = extractUserFromToken(token);

      if (!decodedToken) {
        return NextResponse.json({ message: 'Unauthorized - Invalid token' }, { status: 401 });
      }

      userId = decodedToken.sub;
      userRole = decodedToken.role;
      useAdmin = true; // Use admin client to bypass RLS for JWT auth
    }

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (userRole !== 'service_provider' && userRole !== 'admin') {
      return NextResponse.json({ message: 'Only service providers can create services' }, { status: 403 });
    }

    const body = await req.json();
    
    // Use admin client for JWT auth (bypasses RLS), regular client for Supabase sessions
    const supabase = useAdmin ? supabaseAdmin : supabaseServer;
    const { data, error } = await supabase.from('services').insert({
      ...body,
      provider_id: userId,
    }).select('*').single();

    if (error) throw error;

    return NextResponse.json({ message: 'Service created successfully', service: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while creating the service' },
      { status: 500 }
    );
  }
}