import { Router } from 'express';
import { protect } from '../../../../common/middleware/authMiddleware';
import { AdmissionController } from './admission.controller';

const router = Router();

router.use(protect);

router.put('/admissions/:id/status', AdmissionController.updateAdmissionStatus);

export default router;
