import { Router } from 'express';
import trackingRouter from './care-tracking.routes';
import { protect, restrictTo } from '../../../common/middleware/authMiddleware';
import { CareController } from './care.controller';

const router = Router();

router.use(protect);
router.use(trackingRouter);

// Care request orchestration
router.get('/care-requests', restrictTo('ADMIN'), CareController.getNormalizedRequests);
router.put('/care-requests/:id/priority', restrictTo('ADMIN'), CareController.overridePriority);

// Visit scheduling engine
router.post('/scheduling/visits', restrictTo('ADMIN'), CareController.scheduleOneOff);
router.put('/scheduling/visits/:id', restrictTo('ADMIN'), CareController.rescheduleVisit);
router.delete('/scheduling/visits/:id', restrictTo('ADMIN'), CareController.cancelVisit);


// Overdue care plans
router.get('/care-plans/overdue', restrictTo('ADMIN'), CareController.getOverdueMilestones);
router.put('/care-plans/milestones/:id/complete', CareController.completeMilestone);

// Patient compliance & medication logging
router.get('/patients/:id/compliance', CareController.getComplianceMetrics);
router.post('/patients/:id/medication-logs', CareController.logMedicationDose);
router.get('/patients/:id/medication-logs', CareController.getMedicationLogs);

export default router;
