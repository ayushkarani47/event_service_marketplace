import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import Service from '@/models/Service';
import User from '@/models/User';
import { extractUserFromToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Check for authorization token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }

    // Extract token and user
    const token = authHeader.split(' ')[1];
    const userData = await extractUserFromToken(token);
    
    if (!userData || !userData.sub) {
      return NextResponse.json(
        { message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Parse the request body
    const body = await request.json();
    const { serviceId, startDate, endDate, numberOfGuests, specialRequests, totalPrice } = body;

    // Validate required fields
    if (!serviceId || !startDate) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    // Create a new booking
    const newBooking = new Booking({
      service: serviceId,
      customer: userData.sub,
      status: 'pending',
      startDate,
      endDate: endDate || startDate, // Use startDate as endDate if not provided
      numberOfGuests: numberOfGuests || 1,
      specialRequests,
      totalPrice,
    });

    // Save the booking to the database
    await newBooking.save();

    return NextResponse.json({
      message: 'Booking created successfully',
      booking: newBooking
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Error creating booking:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error creating booking';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check for authorization token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }

    // Extract token and user
    const token = authHeader.split(' ')[1];
    const userData = await extractUserFromToken(token);
    
    if (!userData || !userData.sub) {
      return NextResponse.json(
        { message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = userData.role;

    console.log('User role from token:', role);
    console.log('User ID from token:', userData.sub);

    const query: Record<string, any> = {};

    // Filter bookings based on user role
    if (role === 'customer') {
      query.customer = userData.sub;
    } else if (role === 'service_provider') {
      // For providers, find bookings for their services
      const services = await Service.find({ provider: userData.sub }).select('_id');
      const serviceIds = services.map(service => service._id);
      query.service = { $in: serviceIds };
    } else if (role !== 'admin') {
      // If not admin, customer, or provider, deny access
      console.log('Forbidden - User role is neither customer, service_provider, nor admin:', role);
      return NextResponse.json(
        { message: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Fetch bookings
    const bookings = await Booking.find(query)
      .populate('service', 'title price priceType images')
      .populate('customer', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      bookings
    });

  } catch (error: unknown) {
    console.error('Error fetching bookings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error fetching bookings';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
} 