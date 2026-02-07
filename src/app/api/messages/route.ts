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

// POST /api/messages - Send a new message
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
    
    console.log('Message request body:', JSON.stringify(body));
    
    // Validate required fields
    if (!body.conversationId || !body.content) {
      return NextResponse.json(
        { message: 'Conversation ID and content are required' },
        { status: 400 }
      );
    }

    // Create the message
    const { data: message, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: body.conversationId,
        sender_id: userId,
        receiver_id: body.receiver_id,
        content: body.content,
        read: false
      })
      .select('*, sender:sender_id(id, first_name, last_name, profile_picture)')
      .single();

    if (messageError) throw messageError;

    console.log('Message created:', message.id);

    // Update conversation's last message
    const { error: updateError } = await supabaseAdmin
      .from('conversations')
      .update({
        last_message: body.content,
        last_message_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', body.conversationId);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true, 
      data: message 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Failed to send message',
        error: error.toString()
      },
      { status: error.statusCode || 500 }
    );
  }
}
