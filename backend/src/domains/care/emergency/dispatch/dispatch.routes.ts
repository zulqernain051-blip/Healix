import { Router } from 'express';
import { protect, restrictTo } from '../../../../common/middleware/authMiddleware';
import { EmergencyOperationsController } from '../operations.controller';
import { DispatchController } from './dispatch.controller';
import { ExternalEmergencyController } from '../external/external-emergency.controller';

const router = Router();

router.use(protect);

router.get('/hospitals/recommend', DispatchController.recommendHospitals);
router.get('/dispatch', EmergencyOperationsController.list);
router.get('/emergency/events', restrictTo('DOCTOR'), EmergencyOperationsController.events);
router.post('/dispatch', restrictTo('DOCTOR'), DispatchController.triggerAmbulanceDispatch);
router.put('/dispatch/:id/location', restrictTo('PARAMEDIC'), EmergencyOperationsController.location);
router.post('/dispatch/:id/admission', restrictTo('ADMIN', 'DOCTOR', 'PARAMEDIC'), EmergencyOperationsController.admission);
router.get('/dispatch/:id/tracking', DispatchController.getDispatchTracking);
router.put('/dispatch/:id/status', DispatchController.updateDispatchStatus);
router.post('/emergency/external-request', ExternalEmergencyController.logExternalRequest);

export default router;
