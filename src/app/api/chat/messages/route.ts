import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import mongoose from 'mongoose';

// Direct chat messages API that bypasses middleware authentication
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Get data directly from the request body
    const body = await request.json();
    
    console.log('Chat message request body:', JSON.stringify(body));
    
    // Validate required fields
    if (!body.userId || !body.receiver || !body.content) {
      return NextResponse.json(
        { message: 'User ID, receiver, and content are required' },
        { status: 400 }
      );
    }

    const userId = body.userId;
    
    // Create the message
    const message = await Message.create({
      sender: userId,
      receiver: body.receiver,
      content: body.content,
      serviceId: body.serviceId || null,
      bookingId: body.bookingId || null,
      read: false
    });

    console.log('Message created:', message._id);

    // Update or create conversation
    const participants = [userId, body.receiver].sort();
    
    // Find existing conversation or create new one
    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: participants.length },
      ...(body.serviceId ? { serviceId: body.serviceId } : {}),
      ...(body.bookingId ? { bookingId: body.bookingId } : {})
    });

    if (!conversation) {
      console.log('Creating new conversation');
      conversation = await Conversation.create({
        participants,
        serviceId: body.serviceId || null,
        bookingId: body.bookingId || null,
        lastMessage: body.content,
        lastMessageDate: new Date(),
        unreadCount: { [body.receiver]: 1 }
      });
    } else {
      console.log('Updating existing conversation:', conversation._id);
      // Update last message and increment unread count
      const update: any = {
        lastMessage: body.content,
        lastMessageDate: new Date()
      };
      
      // Increment unread count for receiver
      update[`unreadCount.${body.receiver}`] = (conversation.unreadCount?.[body.receiver] || 0) + 1;
      
      await Conversation.findByIdAndUpdate(conversation._id, {
        $set: update
      });
    }

    // Populate the message
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName profilePicture');

    return NextResponse.json({ 
      success: true, 
      data: populatedMessage 
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
