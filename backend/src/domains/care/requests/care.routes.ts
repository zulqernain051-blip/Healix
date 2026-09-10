import { Router } from 'express';
import { protect } from '../../../common/middleware/authMiddleware';
import { CareController } from './care.controller';

const router = Router();

router.use(protect);

// Care request orchestration
router.get('/care-requests', CareController.getNormalizedRequests);
router.put('/care-requests/:id/priority', CareController.overridePriority);

// Visit scheduling engine
router.post('/scheduling/visits', CareController.scheduleOneOff);
router.put('/scheduling/visits/:id', CareController.rescheduleVisit);
router.delete('/scheduling/visits/:id', CareController.cancelVisit);


// Overdue care plans
router.get('/care-plans/overdue', CareController.getOverdueMilestones);
router.put('/care-plans/milestones/:id/complete', CareController.completeMilestone);

// Patient compliance & medication logging
router.get('/patients/:id/compliance', CareController.getComplianceMetrics);
router.post('/patients/:id/medication-logs', CareController.logMedicationDose);
router.get('/patients/:id/medication-logs', CareController.getMedicationLogs);

export default router;
