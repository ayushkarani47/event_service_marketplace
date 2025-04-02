import { Request, Response } from 'express';
import Review from '../models/Review';
import Booking, { BookingStatus } from '../models/Booking';
import { UserRole } from '../models/User';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Customer only)
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    // Add user id to request body
    req.body.customer = req.user.id;

    // Check if user is a customer
    if (req.user.role !== UserRole.CUSTOMER) {
      res.status(403).json({
        success: false,
        message: 'Only customers can create reviews'
      });
      return;
    }

    // Check if booking exists
    const booking = await Booking.findById(req.body.booking);
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
      return;
    }

    // Check if customer owns the booking
    if (booking.customer.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'You can only review your own bookings'
      });
      return;
    }

    // Check if booking is completed
    if (booking.status !== BookingStatus.COMPLETED) {
      res.status(400).json({
        success: false,
        message: 'You can only review completed bookings'
      });
      return;
    }

    // Add service and provider to review
    req.body.service = booking.service;
    req.body.provider = booking.provider;

    // Check if review already exists
    const existingReview = await Review.findOne({
      booking: req.body.booking,
      customer: req.user.id
    });

    if (existingReview) {
      res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
      return;
    }

    // Create review
    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
};

// @desc    Get reviews for a service
// @route   GET /api/services/:serviceId/reviews
// @access  Public
export const getServiceReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate({
        path: 'customer',
        select: 'name profileImage'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
};

// @desc    Get reviews by a customer
// @route   GET /api/reviews/customer
// @access  Private (Customer only)
export const getCustomerReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is a customer
    if (req.user.role !== UserRole.CUSTOMER) {
      res.status(403).json({
        success: false,
        message: 'Only customers can access this route'
      });
      return;
    }

    const reviews = await Review.find({ customer: req.user.id })
      .populate({
        path: 'service',
        select: 'title category price images'
      })
      .populate({
        path: 'provider',
        select: 'name profileImage'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
};

// @desc    Update a review (only comment and rating)
// @route   PUT /api/reviews/:id
// @access  Private (Customer only)
export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).json({
        success: false,
        message: `Review not found with id of ${req.params.id}`
      });
      return;
    }

    // Make sure the review belongs to the customer
    if (review.customer.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this review`
      });
      return;
    }

    // Only allow updating comment and rating
    const { comment, rating } = req.body;
    
    review = await Review.findByIdAndUpdate(
      req.params.id,
      { comment, rating },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
};

// @desc    Add a reply to a review
// @route   PUT /api/reviews/:id/reply
// @access  Private (Service Provider only)
export const addReviewReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reply } = req.body;
    
    let review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).json({
        success: false,
        message: `Review not found with id of ${req.params.id}`
      });
      return;
    }

    // Make sure the review is for the provider's service
    if (review.provider.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to reply to this review`
      });
      return;
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { reply },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Customer only or Admin)
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).json({
        success: false,
        message: `Review not found with id of ${req.params.id}`
      });
      return;
    }

    // Make sure review belongs to customer or user is admin
    if (review.customer.toString() !== req.user.id && req.user.role !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this review`
      });
      return;
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
}; 