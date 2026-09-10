import { Router } from 'express';
import { protect } from '../../../../common/middleware/authMiddleware';
import { DispatchController } from './dispatch.controller';

const router = Router();

router.use(protect);

router.get('/hospitals/recommend', DispatchController.recommendHospitals);
router.post('/dispatch', DispatchController.triggerAmbulanceDispatch);
router.get('/dispatch/:id/tracking', DispatchController.getDispatchTracking);

export default router;
