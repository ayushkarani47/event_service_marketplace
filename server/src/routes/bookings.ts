import express from 'express';
import {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  updatePaymentStatus
} from '../controllers/bookingController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for all users
router.get('/', getBookings);
router.get('/:id', getBooking);

// Routes for customers only
router.post('/', authorize(UserRole.CUSTOMER), createBooking);
router.put('/:id/payment', authorize(UserRole.CUSTOMER), updatePaymentStatus);

// Routes for both customers and service providers (handled inside controller)
router.put('/:id', updateBookingStatus);

export default router; 