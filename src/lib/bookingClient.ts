// Interface for booking creation data
export interface BookingFormData {
  serviceId: string;
  startDate: string;
  endDate?: string;
  numberOfGuests?: number;
  specialRequests?: string;
  totalPrice: number;
}

// Interface for booking data returned from API
export interface Booking {
  _id: string;
  service: {
    _id: string;
    title: string;
    price: number;
    priceType: string;
    images: string[];
    provider?: string;
  };
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  startDate: string;
  endDate?: string;
  numberOfGuests: number;
  specialRequests?: string;
  totalPrice: number;
  providerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a new booking
 * @param bookingData Booking data
 * @param token Authentication token
 * @returns Created booking
 */
export async function createBooking(bookingData: BookingFormData, token: string): Promise<Booking> {
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create booking');
    }

    const data = await response.json();
    return data.booking;
  } catch (error: any) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

/**
 * Get all bookings for the current user
 * @param token Authentication token
 * @param status Optional status filter
 * @returns Array of bookings
 */
export async function getBookings(token: string, status?: string): Promise<Booking[]> {
  try {
    const url = status ? `/api/bookings?status=${status}` : '/api/bookings';
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch bookings');
    }

    const data = await response.json();
    return data.bookings;
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
}

/**
 * Get a specific booking by ID
 * @param bookingId Booking ID
 * @param token Authentication token
 * @returns Booking details
 */
export async function getBookingById(bookingId: string, token: string): Promise<Booking> {
  try {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch booking');
    }

    const data = await response.json();
    return data.booking;
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    throw error;
  }
}

/**
 * Update the status of a booking
 * @param bookingId Booking ID
 * @param status New status
 * @param token Authentication token
 * @param providerNotes Optional notes from the provider
 * @returns Updated booking
 */
export async function updateBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'completed' | 'cancelled' | 'rejected',
  token: string,
  providerNotes?: string
): Promise<Booking> {
  try {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, providerNotes }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update booking');
    }

    const data = await response.json();
    return data.booking;
  } catch (error: any) {
    console.error('Error updating booking:', error);
    throw error;
  }
} 