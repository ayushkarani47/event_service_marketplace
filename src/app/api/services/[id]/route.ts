import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { ensureModels } from '@/lib/ensureModels';
import { extractUserFromToken } from '@/lib/jwt';
import mongoose from 'mongoose';

// Get a single service by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid service ID format' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDB();

    // Ensure all models are properly registered
    const { Service, User } = ensureModels();
    
    // Find service by ID and populate provider details
    const service = await Service.findById(id).populate(
      'provider',
      'firstName lastName email profilePicture bio'
    );

    if (!service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ service }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while fetching the service' },
      { status: 500 }
    );
  }
}

// Update a service
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid service ID format' },
        { status: 400 }
      );
    }

    // Get authorization header
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

    // Connect to the database
    await connectDB();
    
    // Ensure all models are properly registered
    const { Service } = ensureModels();

    // Find the service
    const service = await Service.findById(id);

    if (!service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the service or an admin
    if (
      service.provider.toString() !== decodedToken.sub && 
      decodedToken.role !== 'admin'
    ) {
      return NextResponse.json(
        { message: 'Unauthorized - You can only update your own services' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    
    // Update the service
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { ...body },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { message: 'Service updated successfully', service: updatedService },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while updating the service' },
      { status: 500 }
    );
  }
}

// Delete a service
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid service ID format' },
        { status: 400 }
      );
    }

    // Get authorization header
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

    // Connect to the database
    await connectDB();
    
    // Ensure all models are properly registered
    const { Service } = ensureModels();

    // Find the service
    const service = await Service.findById(id);

    if (!service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the service or an admin
    if (
      service.provider.toString() !== decodedToken.sub && 
      decodedToken.role !== 'admin'
    ) {
      return NextResponse.json(
        { message: 'Unauthorized - You can only delete your own services' },
        { status: 403 }
      );
    }

    // Delete the service
    await Service.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Service deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while deleting the service' },
      { status: 500 }
    );
  }
} 