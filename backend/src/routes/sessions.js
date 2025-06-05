import { Router } from 'express';
import { 
  createSession,
  getUserSessions,
  getSessionStats,
} from '../controllers/sessionController.js';
import {
  createTeamSession,
  getTeamSession,
  joinTeamSession,
  leaveTeamSession,
  updateTeamSessionStatus,
  sendTeamMessage,
  deleteTeamSession,
} from '../controllers/teamSessionController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Individual sessions
router.post('/', authenticate, createSession);
router.get('/', authenticate, getUserSessions);
router.get('/stats', authenticate, getSessionStats);

// Team sessions
router.post('/team', authenticate, createTeamSession);
router.get('/team/:sessionId', authenticate, getTeamSession);
router.put('/team/:sessionId/join', authenticate, joinTeamSession);
router.put('/team/:sessionId/leave', authenticate, leaveTeamSession);
router.put('/team/:sessionId/status', authenticate, updateTeamSessionStatus);
router.post('/team/:sessionId/messages', authenticate, sendTeamMessage);
router.delete('/team/:sessionId', authenticate, deleteTeamSession);

export default router;