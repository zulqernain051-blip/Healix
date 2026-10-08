import { Router } from 'express';
import { protect, restrictTo } from '../../../../common/middleware/authMiddleware';
import { EscalationController } from './escalation.controller';

const router = Router();

router.use(protect);

router.post('/escalation/:eventId/assign', restrictTo('ADMIN'), EscalationController.assignDoctor);
router.post('/escalation/:eventId/broadcast', restrictTo('ADMIN'), EscalationController.broadcastCase);

export default router;
