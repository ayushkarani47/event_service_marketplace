import { getSupabaseAdmin } from '../supabaseServer';

/**
 * Create a new review
 * @param reviewData Review data
 * @param user Current user
 * @returns Created review
 */
export async function createReview(reviewData: any, user: any) {
  const supabaseAdmin = getSupabaseAdmin();

  // Check if user is a customer
  if (user.role !== 'customer') {
    const error = new Error('Only customers can create reviews');
    (error as any).statusCode = 403;
    throw error;
  }

  // Check if booking exists
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .select('*, services(id, provider_id)')
    .eq('id', reviewData.booking)
    .single();

  if (bookingError || !booking) {
    const error = new Error('Booking not found');
    (error as any).statusCode = 404;
    throw error;
  }

  // Check if customer owns the booking
  if (booking.customer_id !== user.sub) {
    const error = new Error('You can only review your own bookings');
    (error as any).statusCode = 403;
    throw error;
  }

  // Check if booking is completed
  if (booking.status !== 'completed') {
    const error = new Error('You can only review completed bookings');
    (error as any).statusCode = 400;
    throw error;
  }

  // Check if review already exists
  const { data: existingReview } = await supabaseAdmin
    .from('reviews')
    .select('id')
    .eq('booking_id', reviewData.booking)
    .eq('reviewer_id', user.sub)
    .single();

  if (existingReview) {
    const error = new Error('You have already reviewed this booking');
    (error as any).statusCode = 400;
    throw error;
  }

  // Create review
  const { data: review, error: createError } = await supabaseAdmin
    .from('reviews')
    .insert({
      service_id: booking.service_id,
      booking_id: reviewData.booking,
      reviewer_id: user.sub,
      provider_id: booking.services?.provider_id,
      rating: reviewData.rating,
      comment: reviewData.comment
    })
    .select('*, reviewer:reviewer_id(id, first_name, last_name, profile_picture), provider:provider_id(id, first_name, last_name, profile_picture)')
    .single();

  if (createError) throw createError;

  return {
    _id: review.id,
    service: { _id: review.service_id },
    customer: {
      _id: review.reviewer.id,
      name: `${review.reviewer.first_name || ''} ${review.reviewer.last_name || ''}`.trim(),
      profileImage: review.reviewer.profile_picture
    },
    provider: {
      _id: review.provider.id,
      name: `${review.provider.first_name || ''} ${review.provider.last_name || ''}`.trim(),
      profileImage: review.provider.profile_picture
    },
    rating: review.rating,
    comment: review.comment,
    createdAt: review.created_at,
    updatedAt: review.updated_at
  };
}

/**
 * Get reviews for a service
 * @param serviceId Service ID
 * @returns Array of reviews
 */
export async function getServiceReviews(serviceId: string) {
  // Check if serviceId is a UUID (Supabase) or ObjectId (MongoDB)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serviceId);
  
  if (isUUID) {
    // Use Supabase for UUID format
    const { getSupabaseAdmin } = await import('../supabaseServer');
    const supabaseAdmin = getSupabaseAdmin();
    
    // Check if service exists
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('id')
      .eq('id', serviceId)
      .single();
    
    if (serviceError || !service) {
      const error = new Error('Service not found');
      (error as any).statusCode = 404;
      throw error;
    }
    
    // Get reviews for service
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from('reviews')
      .select('*, reviewer:reviewer_id(id, first_name, last_name, profile_picture), provider:provider_id(id, first_name, last_name, profile_picture)')
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false });
    
    if (reviewsError) {
      throw reviewsError;
    }
    
    // Transform Supabase response to match expected format
    return (reviews || []).map((review: any) => ({
      _id: review.id,
      service: { _id: review.service_id },
      customer: review.reviewer ? {
        _id: review.reviewer.id,
        name: `${review.reviewer.first_name || ''} ${review.reviewer.last_name || ''}`.trim(),
        profileImage: review.reviewer.profile_picture
      } : null,
      provider: review.provider ? {
        _id: review.provider.id,
        name: `${review.provider.first_name || ''} ${review.provider.last_name || ''}`.trim(),
        profileImage: review.provider.profile_picture
      } : null,
      rating: review.rating,
      comment: review.comment,
      reply: review.reply,
      createdAt: review.created_at,
      updatedAt: review.updated_at
    }));
  } else {
    // For non-UUID IDs, throw error - only Supabase UUIDs are supported now
    const error = new Error('Invalid service ID format. Only Supabase UUIDs are supported.');
    (error as any).statusCode = 400;
    throw error;
  }
}

/**
 * Get reviews by a customer
 * @param customerId Customer ID
 * @returns Array of reviews
 */
export async function getCustomerReviews(customerId: string) {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: reviews, error } = await supabaseAdmin
    .from('reviews')
    .select('*, service:service_id(id, title, category, price, images), provider:provider_id(id, first_name, last_name, profile_picture)')
    .eq('reviewer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (reviews || []).map((review: any) => ({
    _id: review.id,
    service: { _id: review.service.id, title: review.service.title },
    provider: {
      _id: review.provider.id,
      name: `${review.provider.first_name || ''} ${review.provider.last_name || ''}`.trim(),
      profileImage: review.provider.profile_picture
    },
    rating: review.rating,
    comment: review.comment,
    createdAt: review.created_at,
    updatedAt: review.updated_at
  }));
}

/**
 * Get a specific review by ID
 * @param reviewId Review ID
 * @returns Review
 */
export async function getReviewById(reviewId: string) {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: review, error } = await supabaseAdmin
    .from('reviews')
    .select('*, reviewer:reviewer_id(id, first_name, last_name, profile_picture), provider:provider_id(id, first_name, last_name, profile_picture), service:service_id(id, title, category, price, images)')
    .eq('id', reviewId)
    .single();

  if (error || !review) {
    const error_obj = new Error('Review not found');
    (error_obj as any).statusCode = 404;
    throw error_obj;
  }

  return {
    _id: review.id,
    service: { _id: review.service.id, title: review.service.title },
    customer: {
      _id: review.reviewer.id,
      name: `${review.reviewer.first_name || ''} ${review.reviewer.last_name || ''}`.trim(),
      profileImage: review.reviewer.profile_picture
    },
    provider: {
      _id: review.provider.id,
      name: `${review.provider.first_name || ''} ${review.provider.last_name || ''}`.trim(),
      profileImage: review.provider.profile_picture
    },
    rating: review.rating,
    comment: review.comment,
    reply: review.reply,
    createdAt: review.created_at,
    updatedAt: review.updated_at
  };
}

/**
 * Update a review
 * @param reviewId Review ID
 * @param reviewData Review data to update
 * @param user Current user
 * @returns Updated review
 */
export async function updateReview(reviewId: string, reviewData: any, user: any) {
  const supabaseAdmin = getSupabaseAdmin();

  // Fetch review first
  const { data: review, error: fetchError } = await supabaseAdmin
    .from('reviews')
    .select('reviewer_id')
    .eq('id', reviewId)
    .single();

  if (fetchError || !review) {
    const error_obj = new Error(`Review not found with id of ${reviewId}`);
    (error_obj as any).statusCode = 404;
    throw error_obj;
  }

  // Make sure the review belongs to the customer
  if (review.reviewer_id !== user.sub) {
    const error_obj = new Error(`User ${user.sub} is not authorized to update this review`);
    (error_obj as any).statusCode = 403;
    throw error_obj;
  }

  // Only allow updating comment and rating
  const { comment, rating } = reviewData;
  
  const { data: updatedReview, error: updateError } = await supabaseAdmin
    .from('reviews')
    .update({ comment, rating })
    .eq('id', reviewId)
    .select('*, reviewer:reviewer_id(id, first_name, last_name, profile_picture), provider:provider_id(id, first_name, last_name, profile_picture), service:service_id(id, title, category, price, images)')
    .single();

  if (updateError) throw updateError;

  return {
    _id: updatedReview.id,
    service: { _id: updatedReview.service.id },
    customer: {
      _id: updatedReview.reviewer.id,
      name: `${updatedReview.reviewer.first_name || ''} ${updatedReview.reviewer.last_name || ''}`.trim(),
      profileImage: updatedReview.reviewer.profile_picture
    },
    provider: {
      _id: updatedReview.provider.id,
      name: `${updatedReview.provider.first_name || ''} ${updatedReview.provider.last_name || ''}`.trim(),
      profileImage: updatedReview.provider.profile_picture
    },
    rating: updatedReview.rating,
    comment: updatedReview.comment,
    createdAt: updatedReview.created_at,
    updatedAt: updatedReview.updated_at
  };
}

/**
 * Add a reply to a review
 * @param reviewId Review ID
 * @param reply Reply text
 * @param user Current user
 * @returns Updated review
 */
export async function addReviewReply(reviewId: string, reply: string, user: any) {
  const supabaseAdmin = getSupabaseAdmin();

  // Fetch review first
  const { data: review, error: fetchError } = await supabaseAdmin
    .from('reviews')
    .select('provider_id')
    .eq('id', reviewId)
    .single();

  if (fetchError || !review) {
    const error_obj = new Error(`Review not found with id of ${reviewId}`);
    (error_obj as any).statusCode = 404;
    throw error_obj;
  }

  // Make sure the review is for the provider's service
  if (review.provider_id !== user.sub) {
    const error_obj = new Error(`User ${user.sub} is not authorized to reply to this review`);
    (error_obj as any).statusCode = 403;
    throw error_obj;
  }

  const { data: updatedReview, error: updateError } = await supabaseAdmin
    .from('reviews')
    .update({ reply })
    .eq('id', reviewId)
    .select('*, reviewer:reviewer_id(id, first_name, last_name, profile_picture), provider:provider_id(id, first_name, last_name, profile_picture), service:service_id(id, title, category, price, images)')
    .single();

  if (updateError) throw updateError;

  return {
    _id: updatedReview.id,
    service: { _id: updatedReview.service.id },
    customer: {
      _id: updatedReview.reviewer.id,
      name: `${updatedReview.reviewer.first_name || ''} ${updatedReview.reviewer.last_name || ''}`.trim(),
      profileImage: updatedReview.reviewer.profile_picture
    },
    provider: {
      _id: updatedReview.provider.id,
      name: `${updatedReview.provider.first_name || ''} ${updatedReview.provider.last_name || ''}`.trim(),
      profileImage: updatedReview.provider.profile_picture
    },
    rating: updatedReview.rating,
    comment: updatedReview.comment,
    reply: updatedReview.reply,
    createdAt: updatedReview.created_at,
    updatedAt: updatedReview.updated_at
  };
}

/**
 * Delete a review
 * @param reviewId Review ID
 * @param user Current user
 */
export async function deleteReview(reviewId: string, user: any) {
  const supabaseAdmin = getSupabaseAdmin();

  // Fetch review first
  const { data: review, error: fetchError } = await supabaseAdmin
    .from('reviews')
    .select('reviewer_id')
    .eq('id', reviewId)
    .single();

  if (fetchError || !review) {
    const error_obj = new Error(`Review not found with id of ${reviewId}`);
    (error_obj as any).statusCode = 404;
    throw error_obj;
  }

  // Make sure review belongs to customer or user is admin
  if (review.reviewer_id !== user.sub && user.role !== 'admin') {
    const error_obj = new Error(`User ${user.sub} is not authorized to delete this review`);
    (error_obj as any).statusCode = 403;
    throw error_obj;
  }

  const { error: deleteError } = await supabaseAdmin
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (deleteError) throw deleteError;
}
