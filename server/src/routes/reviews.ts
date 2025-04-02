import express from 'express';
import {
  createReview,
  getCustomerReviews,
  updateReview,
  addReviewReply,
  deleteReview
} from '../controllers/reviewController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes are protected
router.use(protect);

// Customer routes
router.post('/', authorize(UserRole.CUSTOMER), createReview);
router.get('/customer', authorize(UserRole.CUSTOMER), getCustomerReviews);
router.put('/:id', authorize(UserRole.CUSTOMER), updateReview);
router.delete('/:id', authorize(UserRole.CUSTOMER, UserRole.ADMIN), deleteReview);

// Service provider routes
router.put('/:id/reply', authorize(UserRole.SERVICE_PROVIDER), addReviewReply);

export default router; 