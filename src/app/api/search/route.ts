import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ suggestions: [] });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Search services using Supabase full-text search or ILIKE
    const { data: services, error } = await supabaseAdmin
      .from('services')
      .select('id, title, category, location')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,location.ilike.%${query}%`)
      .limit(5);

    if (error) throw error;

    // Format the suggestions
    const suggestions = (services || []).map(service => ({
      id: service.id,
      text: service.title,
      type: 'service',
      category: service.category,
      location: service.location
    }));

    return NextResponse.json({ suggestions: suggestions });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Failed to fetch search suggestions' }, { status: 500 });
  }
}
