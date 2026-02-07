import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';

// Direct chat messages API that bypasses middleware authentication
export async function POST(request: NextRequest) {
  try {
    // Get data directly from the request body
    const body = await request.json();
    const supabaseAdmin = getSupabaseAdmin();
    
    console.log('Chat message request body:', JSON.stringify(body));
    
    // Validate required fields
    if (!body.userId || !body.conversationId || !body.content) {
      return NextResponse.json(
        { message: 'User ID, conversation ID, and content are required' },
        { status: 400 }
      );
    }

    const userId = body.userId;
    
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
