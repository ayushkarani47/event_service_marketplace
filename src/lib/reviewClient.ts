// Interface for review creation data
export interface ReviewFormData {
  booking: string;
  rating: number;
  comment: string;
}

// Interface for review data returned from API
export interface Review {
  _id: string;
  service: {
    _id: string;
    title: string;
    category: string;
    price: number;
    images: string[];
  };
  booking: string;
  customer: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  provider: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  rating: number;
  comment: string;
  reply?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a new review
 * @param reviewData Review data
 * @param token Authentication token
 * @returns Created review
 */
export async function createReview(reviewData: ReviewFormData, token: string): Promise<Review> {
  try {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create review');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    console.error('Error creating review:', error);
    throw error;
  }
}

/**
 * Get reviews for a service
 * @param serviceId Service ID
 * @returns Array of reviews
 */
export async function getServiceReviews(serviceId: string): Promise<Review[]> {
  try {
    const response = await fetch(`/api/services/${serviceId}/reviews`);

    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response received:', await response.text());
      return []; // Return empty array instead of throwing
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch reviews');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error: any) {
    console.error('Error fetching service reviews:', error);
    return []; // Return empty array instead of throwing
  }
}

/**
 * Get reviews by the current customer
 * @param token Authentication token
 * @returns Array of reviews
 */
export async function getCustomerReviews(token: string): Promise<Review[]> {
  try {
    const response = await fetch('/api/reviews/customer', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch reviews');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    console.error('Error fetching customer reviews:', error);
    throw error;
  }
}

/**
 * Update a review
 * @param reviewId Review ID
 * @param reviewData Review data to update
 * @param token Authentication token
 * @returns Updated review
 */
export async function updateReview(
  reviewId: string, 
  reviewData: { rating: number; comment: string }, 
  token: string
): Promise<Review> {
  try {
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update review');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    console.error('Error updating review:', error);
    throw error;
  }
}

/**
 * Delete a review
 * @param reviewId Review ID
 * @param token Authentication token
 */
export async function deleteReview(reviewId: string, token: string): Promise<void> {
  try {
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete review');
    }
  } catch (error: any) {
    console.error('Error deleting review:', error);
    throw error;
  }
}
