// Common API response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

// Common query parameters
export interface QueryParams {
  page?: number | string;
  limit?: number | string;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: any; // Allow additional query parameters
}
