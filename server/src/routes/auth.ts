import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/updateprofile', updateProfile);
router.put('/updatepassword', updatePassword);

export default router; 