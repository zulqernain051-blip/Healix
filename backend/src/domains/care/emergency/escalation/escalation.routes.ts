import { Router } from 'express';
import { protect } from '../../../../common/middleware/authMiddleware';
import { EscalationController } from './escalation.controller';

const router = Router();

router.use(protect);

router.post('/escalation/:eventId/assign', EscalationController.assignDoctor);
router.post('/escalation/:eventId/broadcast', EscalationController.broadcastCase);

export default router;
