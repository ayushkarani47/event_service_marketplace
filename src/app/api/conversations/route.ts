import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Conversation from '@/models/Conversation';
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

// GET /api/conversations - Get all conversations for the current user
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const bookingId = searchParams.get('bookingId');

    // Build query
    const query: any = {
      participants: new mongoose.Types.ObjectId(userId),
    };

    if (serviceId) {
      query.serviceId = new mongoose.Types.ObjectId(serviceId);
    }

    if (bookingId) {
      query.bookingId = new mongoose.Types.ObjectId(bookingId);
    }

    // Get conversations
    const conversations = await Conversation.find(query)
      .populate('participants', 'firstName lastName profilePicture')
      .populate('serviceId', 'title images')
      .sort({ lastMessageDate: -1 });

    return NextResponse.json({ success: true, data: conversations });
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
    
    console.log('Conversation request body:', JSON.stringify(body));
    
    // Validate required fields
    if (!body.participants || !Array.isArray(body.participants) || body.participants.length === 0) {
      return NextResponse.json(
        { message: 'Participants are required' },
        { status: 400 }
      );
    }

    // Make sure the current user is included in participants
    if (!body.participants.includes(userId)) {
      body.participants.push(userId);
    }

    console.log('Looking for existing conversation with participants:', body.participants);

    // Check if conversation already exists between these participants
    const existingConversation = await Conversation.findOne({
      participants: { $all: body.participants, $size: body.participants.length },
      ...(body.serviceId ? { serviceId: body.serviceId } : {}),
      ...(body.bookingId ? { bookingId: body.bookingId } : {})
    });

    if (existingConversation) {
      console.log('Found existing conversation:', existingConversation._id);
      return NextResponse.json({ 
        success: true, 
        data: existingConversation,
        message: 'Conversation already exists'
      });
    }

    console.log('Creating new conversation');
    // Create new conversation
    const conversation = await Conversation.create({
      participants: body.participants,
      serviceId: body.serviceId || null,
      bookingId: body.bookingId || null,
      unreadCount: {}
    });

    console.log('New conversation created:', conversation._id);

    // Populate the conversation
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'firstName lastName profilePicture')
      .populate('serviceId', 'title images');

    return NextResponse.json({ 
      success: true, 
      data: populatedConversation 
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
