import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
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

// GET /api/conversations/:id - Get a specific conversation and its messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const isParticipant = conversation.participants.some((p: any) => p._id.toString() === userId);
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
        { sender: userId, receiver: { $in: conversation.participants.map((p: any) => p._id) } },
        { receiver: userId, sender: { $in: conversation.participants.map((p: any) => p._id) } }
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

// DELETE /api/conversations/:id - Delete a conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const isParticipant = conversation.participants.some((p: any) => p.toString() === userId);
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
