import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Paths that are accessible without authentication
const publicPaths = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/forgot-password',
  '/reset-password',
];

// Public API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth/',
  '/api/services', // Public service listings
  '/api/categories',
];

// Check if the path is a public path or starts with one of the public paths
const isPublicPath = (path: string) => {
  // Check for exact matches or subpaths of public paths
  if (publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith(`${publicPath}/`))) {
    return true;
  }
  
  // Check for public API routes
  if (publicApiRoutes.some(apiRoute => path.startsWith(apiRoute))) {
    return true;
  }
  
  // Allow Next.js resources and favicon
  if (path.startsWith('/_next/') || path.startsWith('/favicon.ico')) {
    return true;
  }
  
  return false;
};

// Check if the path is a chat-related API route
const isChatApiRoute = (path: string) => {
  return path.startsWith('/api/conversations') || path.startsWith('/api/messages');
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirect root path to login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Allow access to public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Special handling for chat API routes
  if (isChatApiRoute(pathname)) {
    // For chat routes, we'll check the token but won't redirect
    // This allows the chat components to handle authentication errors
    return NextResponse.next();
  }

  // Check if user is authenticated
  const token = request.cookies.get('token')?.value;
  
  // If not authenticated, redirect to login
  if (!token) {
    // For API routes, return a 401 Unauthorized response
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ message: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // For non-API routes, redirect to login
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
