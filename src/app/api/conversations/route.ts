import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import { extractUserFromToken } from '@/lib/jwt';

// Helper function to get the current user from the token
function getCurrentUser(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No Authorization header found');
      return null;
    }
    
    const token = authHeader.substring(7);
    const decoded = extractUserFromToken(token);
    
    if (!decoded || !decoded.sub) {
      console.error('Invalid token');
      return null;
    }
    
    console.log('User authenticated via Authorization header');
    return decoded;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// GET /api/conversations - Get all conversations for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the current user from the token
    const user = getCurrentUser(request);
    if (!user) {
      console.log('Unauthorized: No valid user found');
      return NextResponse.json(
        { message: 'Unauthorized - Please log in again' },
        { status: 401 }
      );
    }

    if (!user.sub) {
      console.log('Invalid user ID in token');
      return NextResponse.json(
        { message: 'Invalid user information' },
        { status: 401 }
      );
    }

    const userId = user.sub;
    const supabaseAdmin = getSupabaseAdmin();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const bookingId = searchParams.get('bookingId');

    // Build query - get conversations where user is a participant
    let query = supabaseAdmin
      .from('conversations')
      .select('*, participants:conversation_participants(user_id), service:service_id(id, title, images)')
      .contains('participant_ids', [userId]);

    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }

    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }

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

// POST /api/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    // Get the current user from the token
    const user = getCurrentUser(request);
    if (!user) {
      console.log('Unauthorized: No valid user found');
      return NextResponse.json(
        { message: 'Unauthorized - Please log in again' },
        { status: 401 }
      );
    }

    if (!user.sub) {
      console.log('Invalid user ID in token');
      return NextResponse.json(
        { message: 'Invalid user information' },
        { status: 401 }
      );
    }

    const userId = user.sub;
    const body = await request.json();
    const supabaseAdmin = getSupabaseAdmin();
    
    console.log('Conversation request body:', JSON.stringify(body));
    
    // Validate required fields
    if (!body.participants || !Array.isArray(body.participants) || body.participants.length === 0) {
      return NextResponse.json(
        { message: 'Participants are required' },
        { status: 400 }
      );
    }

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
