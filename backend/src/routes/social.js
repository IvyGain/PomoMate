import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/socialController.js';

const router = Router();

// Friends
router.get('/friends', authenticate, getFriends);
router.post('/friends/request', authenticate, sendFriendRequest);
router.put('/friends/request/:requestId/accept', authenticate, acceptFriendRequest);
router.put('/friends/request/:requestId/reject', authenticate, rejectFriendRequest);
router.delete('/friends/:friendId', authenticate, removeFriend);

// Notifications
router.get('/notifications', authenticate, getNotifications);
router.put('/notifications/:notificationId/read', authenticate, markNotificationRead);
router.put('/notifications/read-all', authenticate, markAllNotificationsRead);

export default router;