import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';

// GET /api/chat/conversations/:id - Get a specific conversation and its messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Get the user ID from the query parameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const conversationId = params.id;

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

// DELETE /api/chat/conversations/:id - Delete a conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Get the user ID from the query parameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const conversationId = params.id;

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
