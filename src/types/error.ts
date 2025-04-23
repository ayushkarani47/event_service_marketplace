// Define custom error types for use throughout the application
export interface ApiError extends Error {
  message: string;
  status?: number;
  code?: string;
}

export interface ValidationError extends ApiError {
  errors?: Record<string, string>;
}

export interface DatabaseError extends ApiError {
  dbMessage?: string;
}

export interface AuthError extends ApiError {
  token?: string;
}

// Type for handling unknown errors
export type UnknownError = Error | ApiError | ValidationError | DatabaseError | AuthError | unknown;
