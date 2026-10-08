import { Router } from 'express';
import { protect, restrictTo } from '../../../../common/middleware/authMiddleware';
import { AdmissionController } from './admission.controller';

const router = Router();

router.use(protect);

router.put('/admissions/:id/status', restrictTo('ADMIN', 'DOCTOR', 'PARAMEDIC'), AdmissionController.updateAdmissionStatus);

export default router;
