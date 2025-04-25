import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Helper function to get the current user from the token
function getCurrentUser(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      // Try to get token from Authorization header as fallback
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const headerToken = authHeader.substring(7);
        try {
          const decoded = jwt.verify(headerToken, process.env.JWT_SECRET || 'your_jwt_secret') as { _id: string };
          console.log('User authenticated via Authorization header');
          return decoded;
        } catch (err) {
          console.error('Invalid token in Authorization header:', err);
        }
      }
      
      console.log('No token found in cookies or Authorization header');
      return null;
    }
    
    // Verify the token from cookies
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as { _id: string };
      console.log('User authenticated via cookie token');
      return decoded;
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      
      // If the token is expired or invalid, try to get it from localStorage via headers
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const headerToken = authHeader.substring(7);
        try {
          const decoded = jwt.verify(headerToken, process.env.JWT_SECRET || 'your_jwt_secret') as { _id: string };
          console.log('User authenticated via Authorization header (fallback)');
          return decoded;
        } catch (err) {
          console.error('Invalid token in Authorization header (fallback):', err);
        }
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// POST /api/messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get the current user from the token
    const user = getCurrentUser(request);
    if (!user) {
      console.log('Unauthorized: No valid user found');
      return NextResponse.json(
        { message: 'Unauthorized - Please log in again' },
        { status: 401 }
      );
    }

    if (!user._id) {
      console.log('Invalid user ID in token');
      return NextResponse.json(
        { message: 'Invalid user information' },
        { status: 401 }
      );
    }

    const userId = user._id;
    const body = await request.json();
    
    console.log('Message request body:', JSON.stringify(body));
    
    // Validate required fields
    if (!body.receiver || !body.content) {
      return NextResponse.json(
        { message: 'Receiver and content are required' },
        { status: 400 }
      );
    }

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
