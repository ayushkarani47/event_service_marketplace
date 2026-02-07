import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '@/models/User';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable');
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
export const generateToken = (user: IUser) => {
  const payload = {
    sub: user._id,
    email: user.email,
  };

  const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN } as any;
  return jwt.sign(payload, JWT_SECRET, signOptions);
};

// Verify JWT token
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Extract user info from JWT token
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  iat: number;
  exp: number;
}

export const extractUserFromToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('JWT verification error:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};