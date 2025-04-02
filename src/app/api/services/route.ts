import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Service from '@/models/Service';
import { extractUserFromToken } from '@/lib/jwt';

// Get all services or filter by query params
export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await connectDB();

    // Get query parameters
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const provider = url.searchParams.get('provider');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const minRating = url.searchParams.get('minRating');
    const location = url.searchParams.get('location');
    const search = url.searchParams.get('search');

    // Build query
    const query: any = {};
    
    if (category) query.category = category;
    if (provider) query.provider = provider;
    if (minPrice) query.price = { $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Find services and populate provider details
    const services = await Service.find(query)
      .populate('provider', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1 });

    return NextResponse.json({ services }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while fetching services' },
      { status: 500 }
    );
  }
}

// Create a new service
export async function POST(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.split(' ')[1];
    const decodedToken = extractUserFromToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is a service provider
    if (decodedToken.role !== 'service_provider' && decodedToken.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized - Only service providers can create services' },
        { status: 403 }
      );
    }

    // Connect to the database
    await connectDB();

    // Parse request body
    const body = await req.json();
    
    // Create new service
    const service = await Service.create({
      ...body,
      provider: decodedToken.sub, // Set the provider to the current user ID
    });

    return NextResponse.json(
      { message: 'Service created successfully', service },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while creating the service' },
      { status: 500 }
    );
  }
} 