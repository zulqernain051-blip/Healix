import { Router } from 'express';
import { protect } from '../../../common/middleware/authMiddleware';
import { NotificationController } from './notification.controller';

const router = Router();

router.use(protect);

router.get('/notifications', NotificationController.getNotifications);
router.put('/notifications/:id/read', NotificationController.markAsRead);
router.put('/notifications/preferences', NotificationController.updatePreferences);

export default router;
