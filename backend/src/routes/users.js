import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getUserStats,
  getUserAchievements,
  updateCharacter,
  getActiveDays,
  getLeaderboard
} from '../controllers/userController.js';

const router = Router();

// User stats and progress
router.get('/:userId/stats', authenticate, getUserStats);
router.get('/:userId/achievements', authenticate, getUserAchievements);
router.get('/:userId/active-days', authenticate, getActiveDays);
router.put('/:userId/character', authenticate, updateCharacter);

// Leaderboard
router.get('/leaderboard', authenticate, getLeaderboard);

export default router;