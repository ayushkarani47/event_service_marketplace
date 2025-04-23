import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import mongoose from 'mongoose';

// GET /api/chat/conversations/:id - Get a specific conversation and its messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

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
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'firstName lastName profilePicture')
      .populate('serviceId', 'title images');

    if (!conversation) {
      console.log(`Conversation not found: ${conversationId}`);
      return NextResponse.json(
        { message: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some((p: any) => 
      p._id?.toString() === userId || p.toString() === userId
    );
    
    if (!isParticipant) {
      console.log(`User ${userId} is not authorized to view conversation ${conversationId}`);
      return NextResponse.json(
        { message: 'You are not authorized to view this conversation' },
        { status: 403 }
      );
    }

    console.log(`Fetching messages for conversation: ${conversationId}`);

    // Get messages for this conversation
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: { $in: conversation.participants.map((p: any) => p._id || p) } },
        { receiver: userId, sender: { $in: conversation.participants.map((p: any) => p._id || p) } }
      ],
      ...(conversation.serviceId ? { serviceId: conversation.serviceId } : {}),
      ...(conversation.bookingId ? { bookingId: conversation.bookingId } : {})
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'firstName lastName profilePicture');

    console.log(`Found ${messages.length} messages for conversation: ${conversationId}`);

    // Mark messages as read
    await Message.updateMany(
      { receiver: userId, read: false },
      { read: true }
    );

    // Reset unread count for this user
    const unreadCountUpdate: any = {};
    unreadCountUpdate[`unreadCount.${userId}`] = 0;
    await Conversation.findByIdAndUpdate(conversationId, { $set: unreadCountUpdate });

    return NextResponse.json({ 
      success: true, 
      data: { conversation, messages } 
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
    await connectDB();

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
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      console.log(`Conversation not found: ${conversationId}`);
      return NextResponse.json(
        { message: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some((p: any) => 
      p.toString() === userId
    );
    
    if (!isParticipant) {
      console.log(`User ${userId} is not authorized to delete conversation ${conversationId}`);
      return NextResponse.json(
        { message: 'You are not authorized to delete this conversation' },
        { status: 403 }
      );
    }

    console.log(`Deleting messages for conversation: ${conversationId}`);

    // Delete all messages in the conversation
    await Message.deleteMany({
      $or: [
        { sender: userId, receiver: { $in: conversation.participants } },
        { receiver: userId, sender: { $in: conversation.participants } }
      ],
      ...(conversation.serviceId ? { serviceId: conversation.serviceId } : {}),
      ...(conversation.bookingId ? { bookingId: conversation.bookingId } : {})
    });

    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);
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
