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

// GET /api/conversations/:id - Get a specific conversation and its messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const conversationId = params.id;
    const supabaseAdmin = getSupabaseAdmin();

    console.log(`Fetching conversation: ${conversationId} for user: ${userId}`);

    // Get the conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('*, service:service_id(id, title, images)')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      console.log(`Conversation not found: ${conversationId}`);
      return NextResponse.json(
        { message: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user is a participant
    const isParticipant = conversation.participant_ids && conversation.participant_ids.includes(userId);
    if (!isParticipant) {
      console.log(`User ${userId} is not authorized to view conversation ${conversationId}`);
      return NextResponse.json(
        { message: 'You are not authorized to view this conversation' },
        { status: 403 }
      );
    }

    console.log(`Fetching messages for conversation: ${conversationId}`);

    // Get messages for this conversation
    const { data: messages, error: msgError } = await supabaseAdmin
      .from('messages')
      .select('*, sender:sender_id(id, first_name, last_name, profile_picture)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) throw msgError;

    console.log(`Found ${messages?.length || 0} messages for conversation: ${conversationId}`);

    // Mark messages as read for this user
    await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .eq('read', false);

    return NextResponse.json({ 
      success: true, 
      data: { conversation, messages: messages || [] } 
    });
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Failed to fetch conversation',
        error: error.toString()
      },
      { status: error.statusCode || 500 }
    );
  }
}

// DELETE /api/conversations/:id - Delete a conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const conversationId = params.id;
    const supabaseAdmin = getSupabaseAdmin();

    console.log(`Deleting conversation: ${conversationId} for user: ${userId}`);

    // Get the conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      console.log(`Conversation not found: ${conversationId}`);
      return NextResponse.json(
        { message: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user is a participant
    const isParticipant = conversation.participant_ids && conversation.participant_ids.includes(userId);
    if (!isParticipant) {
      console.log(`User ${userId} is not authorized to delete conversation ${conversationId}`);
      return NextResponse.json(
        { message: 'You are not authorized to delete this conversation' },
        { status: 403 }
      );
    }

    console.log(`Deleting messages for conversation: ${conversationId}`);

    // Delete all messages in the conversation
    const { error: deleteMessagesError } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (deleteMessagesError) throw deleteMessagesError;

    // Delete the conversation
    const { error: deleteConvError } = await supabaseAdmin
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (deleteConvError) throw deleteConvError;

    console.log(`Conversation ${conversationId} deleted successfully`);

    return NextResponse.json({ 
      success: true, 
      message: 'Conversation deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Failed to delete conversation',
        error: error.toString()
      },
      { status: error.statusCode || 500 }
    );
  }
}
