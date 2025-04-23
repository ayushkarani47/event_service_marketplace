import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Simple API endpoint to check authentication status
export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieToken = request.cookies.get('token')?.value;
    
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    let headerToken = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      headerToken = authHeader.substring(7);
    }
    
    // Check if we have any token
    if (!cookieToken && !headerToken) {
      return NextResponse.json({
        authenticated: false,
        message: 'No authentication token found',
        cookieToken: null,
        headerToken: null
      }, { status: 200 });
    }
    
    // Try to verify cookie token
    let cookieTokenValid = false;
    let cookieTokenData = null;
    if (cookieToken) {
      try {
        cookieTokenData = jwt.verify(cookieToken, process.env.JWT_SECRET || 'your_jwt_secret');
        cookieTokenValid = true;
      } catch (error) {
        console.error('Cookie token verification failed:', error);
      }
    }
    
    // Try to verify header token
    let headerTokenValid = false;
    let headerTokenData = null;
    if (headerToken) {
      try {
        headerTokenData = jwt.verify(headerToken, process.env.JWT_SECRET || 'your_jwt_secret');
        headerTokenValid = true;
      } catch (error) {
        console.error('Header token verification failed:', error);
      }
    }
    
    // Return authentication status
    return NextResponse.json({
      authenticated: cookieTokenValid || headerTokenValid,
      cookieToken: cookieToken ? {
        valid: cookieTokenValid,
        data: cookieTokenValid ? cookieTokenData : null
      } : null,
      headerToken: headerToken ? {
        valid: headerTokenValid,
        data: headerTokenValid ? headerTokenData : null
      } : null
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking authentication:', error);
    return NextResponse.json({
      authenticated: false,
      error: 'Failed to check authentication'
    }, { status: 500 });
  }
}
