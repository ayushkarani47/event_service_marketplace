import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';

// Direct chat API that bypasses middleware authentication
export async function POST(request: NextRequest) {
  try {
    // Get the user ID directly from the request body
    const body = await request.json();
    const supabaseAdmin = getSupabaseAdmin();
    
    console.log('Chat conversation request body:', JSON.stringify(body));
    
    if (!body.userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!body.participants || !Array.isArray(body.participants) || body.participants.length === 0) {
      return NextResponse.json(
        { message: 'Participants are required' },
        { status: 400 }
      );
    }

    const userId = body.userId;
    
    // Make sure the current user is included in participants
    const participants = [...new Set([...body.participants, userId])]; // Remove duplicates

    console.log('Looking for existing conversation with participants:', participants);

    // Check if conversation already exists between these participants
    const { data: existingConversations } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .contains('participant_ids', participants)
      .eq('service_id', body.serviceId || null)
      .eq('booking_id', body.bookingId || null);

    if (existingConversations && existingConversations.length > 0) {
      console.log('Found existing conversation:', existingConversations[0].id);
      return NextResponse.json({ 
        success: true, 
        data: existingConversations[0],
        message: 'Conversation already exists'
      });
    }

    console.log('Creating new conversation');
    // Create new conversation
    const { data: conversation, error: createError } = await supabaseAdmin
      .from('conversations')
      .insert({
        participant_ids: participants,
        service_id: body.serviceId || null,
        booking_id: body.bookingId || null,
        last_message: null,
        last_message_date: null
      })
      .select('*, service:service_id(id, title, images)')
      .single();

    if (createError) throw createError;

    console.log('New conversation created:', conversation.id);

    return NextResponse.json({ 
      success: true, 
      data: conversation 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Failed to create conversation',
        error: error.toString()
      },
      { status: error.statusCode || 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Get the user ID from the query parameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const serviceId = searchParams.get('serviceId');
    const bookingId = searchParams.get('bookingId');
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build query - get conversations where user is a participant
    let query = supabaseAdmin
      .from('conversations')
      .select('*, service:service_id(id, title, images)')
      .contains('participant_ids', [userId]);

    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }

    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }

    // Get conversations
    const { data: conversations, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: conversations || [] });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Failed to fetch conversations',
        error: error.toString()
      },
      { status: error.statusCode || 500 }
    );
  }
}
