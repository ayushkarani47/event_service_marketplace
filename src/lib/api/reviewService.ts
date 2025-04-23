import connectDB from '../db';
import Review from '../../models/Review';
import Booking from '../../models/Booking';
import Service from '../../models/Service';
import mongoose from 'mongoose';

/**
 * Create a new review
 * @param reviewData Review data
 * @param user Current user
 * @returns Created review
 */
export async function createReview(reviewData: any, user: any) {
  await connectDB();

  // Check if user is a customer
  if (user.role !== 'customer') {
    const error = new Error('Only customers can create reviews');
    (error as any).statusCode = 403;
    throw error;
  }

  // Check if booking exists
  const booking = await Booking.findById(reviewData.booking).populate('service');
  if (!booking) {
    const error = new Error('Booking not found');
    (error as any).statusCode = 404;
    throw error;
  }

  // Check if customer owns the booking
  if (booking.customer.toString() !== user._id) {
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

  // Add service and provider to review
  const serviceDoc = booking.service as any;
  reviewData.service = serviceDoc._id;
  reviewData.provider = serviceDoc.provider;
  reviewData.customer = user._id;

  // Check if review already exists
  const existingReview = await Review.findOne({
    booking: reviewData.booking,
    customer: user._id
  });

  if (existingReview) {
    const error = new Error('You have already reviewed this booking');
    (error as any).statusCode = 400;
    throw error;
  }

  // Create review
  const review = await Review.create(reviewData);

  // Populate customer and provider details
  const populatedReview = await Review.findById(review._id)
    .populate('customer', 'firstName lastName profileImage')
    .populate('provider', 'firstName lastName profileImage')
    .populate('service', 'title category price images');

  return populatedReview;
}

/**
 * Get reviews for a service
 * @param serviceId Service ID
 * @returns Array of reviews
 */
export async function getServiceReviews(serviceId: string) {
  await connectDB();

  // Check if service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    const error = new Error('Service not found');
    (error as any).statusCode = 404;
    throw error;
  }

  // Get reviews for service
  const reviews = await Review.find({ service: serviceId })
    .populate({
      path: 'customer',
      select: 'firstName lastName profileImage',
      transform: doc => {
        if (doc) {
          return {
            _id: doc._id,
            name: `${doc.firstName} ${doc.lastName}`,
            profileImage: doc.profileImage
          };
        }
        return null;
      }
    })
    .populate({
      path: 'provider',
      select: 'firstName lastName profileImage',
      transform: doc => {
        if (doc) {
          return {
            _id: doc._id,
            name: `${doc.firstName} ${doc.lastName}`,
            profileImage: doc.profileImage
          };
        }
        return null;
      }
    })
    .sort({ createdAt: -1 });

  return reviews;
}

/**
 * Get reviews by a customer
 * @param customerId Customer ID
 * @returns Array of reviews
 */
export async function getCustomerReviews(customerId: string) {
  await connectDB();

  const reviews = await Review.find({ customer: customerId })
    .populate({
      path: 'service',
      select: 'title category price images'
    })
    .populate({
      path: 'provider',
      select: 'firstName lastName profileImage',
      transform: doc => {
        if (doc) {
          return {
            _id: doc._id,
            name: `${doc.firstName} ${doc.lastName}`,
            profileImage: doc.profileImage
          };
        }
        return null;
      }
    })
    .sort({ createdAt: -1 });

  return reviews;
}

/**
 * Get a specific review by ID
 * @param reviewId Review ID
 * @returns Review
 */
export async function getReviewById(reviewId: string) {
  await connectDB();

  const review = await Review.findById(reviewId)
    .populate({
      path: 'customer',
      select: 'firstName lastName profileImage',
      transform: doc => {
        if (doc) {
          return {
            _id: doc._id,
            name: `${doc.firstName} ${doc.lastName}`,
            profileImage: doc.profileImage
          };
        }
        return null;
      }
    })
    .populate({
      path: 'provider',
      select: 'firstName lastName profileImage',
      transform: doc => {
        if (doc) {
          return {
            _id: doc._id,
            name: `${doc.firstName} ${doc.lastName}`,
            profileImage: doc.profileImage
          };
        }
        return null;
      }
    })
    .populate('service', 'title category price images');

  if (!review) {
    const error = new Error('Review not found');
    (error as any).statusCode = 404;
    throw error;
  }

  return review;
}

/**
 * Update a review
 * @param reviewId Review ID
 * @param reviewData Review data to update
 * @param user Current user
 * @returns Updated review
 */
export async function updateReview(reviewId: string, reviewData: any, user: any) {
  await connectDB();

  let review = await Review.findById(reviewId);

  if (!review) {
    const error = new Error(`Review not found with id of ${reviewId}`);
    (error as any).statusCode = 404;
    throw error;
  }

  // Make sure the review belongs to the customer
  if (review.customer.toString() !== user._id) {
    const error = new Error(`User ${user._id} is not authorized to update this review`);
    (error as any).statusCode = 403;
    throw error;
  }

  // Only allow updating comment and rating
  const { comment, rating } = reviewData;
  
  review = await Review.findByIdAndUpdate(
    reviewId,
    { comment, rating },
    { new: true, runValidators: true }
  )
    .populate({
      path: 'customer',
      select: 'firstName lastName profileImage',
      transform: doc => {
        if (doc) {
          return {
            _id: doc._id,
            name: `${doc.firstName} ${doc.lastName}`,
            profileImage: doc.profileImage
          };
        }
        return null;
      }
    })
    .populate({
      path: 'provider',
      select: 'firstName lastName profileImage',
      transform: doc => {
        if (doc) {
          return {
            _id: doc._id,
            name: `${doc.firstName} ${doc.lastName}`,
            profileImage: doc.profileImage
          };
        }
        return null;
      }
    })
    .populate('service', 'title category price images');

  return review;
}

/**
 * Add a reply to a review
 * @param reviewId Review ID
 * @param reply Reply text
 * @param user Current user
 * @returns Updated review
 */
export async function addReviewReply(reviewId: string, reply: string, user: any) {
  await connectDB();

  let review = await Review.findById(reviewId);

  if (!review) {
    const error = new Error(`Review not found with id of ${reviewId}`);
    (error as any).statusCode = 404;
    throw error;
  }

  // Make sure the review is for the provider's service
  if (review.provider.toString() !== user._id) {
    const error = new Error(`User ${user._id} is not authorized to reply to this review`);
    (error as any).statusCode = 403;
    throw error;
  }

  review = await Review.findByIdAndUpdate(
    reviewId,
    { reply },
    { new: true, runValidators: true }
  )
    .populate({
      path: 'customer',
      select: 'firstName lastName profileImage',
      transform: doc => {
        if (doc) {
          return {
            _id: doc._id,
            name: `${doc.firstName} ${doc.lastName}`,
            profileImage: doc.profileImage
          };
        }
        return null;
      }
    })
    .populate({
      path: 'provider',
      select: 'firstName lastName profileImage',
      transform: doc => {
        if (doc) {
          return {
            _id: doc._id,
            name: `${doc.firstName} ${doc.lastName}`,
            profileImage: doc.profileImage
          };
        }
        return null;
      }
    })
    .populate('service', 'title category price images');

  return review;
}

/**
 * Delete a review
 * @param reviewId Review ID
 * @param user Current user
 */
export async function deleteReview(reviewId: string, user: any) {
  await connectDB();

  const review = await Review.findById(reviewId);

  if (!review) {
    const error = new Error(`Review not found with id of ${reviewId}`);
    (error as any).statusCode = 404;
    throw error;
  }

  // Make sure review belongs to customer or user is admin
  if (review.customer.toString() !== user._id && user.role !== 'admin') {
    const error = new Error(`User ${user._id} is not authorized to delete this review`);
    (error as any).statusCode = 403;
    throw error;
  }

  await review.deleteOne();
}
