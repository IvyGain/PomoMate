import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getGames,
  getGameScores,
  submitScore,
  unlockGame
} from '../controllers/gameController.js';

const router = Router();

router.get('/', authenticate, getGames);
router.get('/:gameId/scores', authenticate, getGameScores);
router.post('/:gameId/scores', authenticate, submitScore);
router.put('/:gameId/unlock', authenticate, unlockGame);

export default router;