import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getSettings,
  updateSettings
} from '../controllers/settingsController.js';

const router = Router();

router.get('/', authenticate, getSettings);
router.put('/', authenticate, updateSettings);

export default router;