import express from 'express';
import {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
  getProviderServices
} from '../controllers/serviceController';
import { getServiceReviews } from '../controllers/reviewController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getService);
router.get('/provider/:id', getProviderServices);
router.get('/:serviceId/reviews', getServiceReviews);

// Protected routes
router.use(protect);
router.post('/', authorize(UserRole.SERVICE_PROVIDER), createService);
router.put('/:id', authorize(UserRole.SERVICE_PROVIDER, UserRole.ADMIN), updateService);
router.delete('/:id', authorize(UserRole.SERVICE_PROVIDER, UserRole.ADMIN), deleteService);

export default router; 