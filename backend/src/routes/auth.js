import { Router } from 'express';
import { 
  register, 
  login, 
  logout, 
  refreshToken, 
  getMe, 
  updateProfile,
  resetPasswordRequest, 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public routes (with rate limiting)
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/refresh', refreshToken);
router.post('/reset-password', authRateLimiter, resetPasswordRequest);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;