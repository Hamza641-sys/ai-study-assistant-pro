import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} from '../validators/authValidators.js';

const router = express.Router();

// Public routes (with strict rate limiter)
router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login',    authLimiter, loginValidator,    validate, login);

// Protected routes
router.get('/me',              protect, getMe);
router.put('/profile',         protect, updateProfileValidator, validate, updateProfile);
router.put('/change-password', protect, changePasswordValidator, validate, changePassword);

export default router;
