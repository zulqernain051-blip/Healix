import { Router } from 'express';
import { protect } from '../../../../common/middleware/authMiddleware';
import { VerificationController } from './verification.controller';

const router = Router();

router.use(protect);

// 11.1 Attendance Tracking
router.put('/visits/:id/check-in',  VerificationController.checkIn);
router.put('/visits/:id/check-out', VerificationController.checkOut);
router.get('/visits/:id/attendance', VerificationController.getAttendance);

// 11.2 Arrival Confirmation
router.put('/visits/:id/confirm-arrival', VerificationController.confirmArrival);

// 11.5 QR Token Management
router.get('/visits/:id/qr-code', VerificationController.getQrToken);

// 11.6 Verification Methods
router.post('/visits/:id/verify-qr', VerificationController.verifyWithQr);
router.post('/visits/:id/verify-gps', VerificationController.verifyWithGps);
router.post('/visits/:id/verify-manual', VerificationController.verifyManual);

// 11.3 Visit Completion
router.put('/visits/:id/complete', VerificationController.completeVisit);

// 11.4 Evidence Management
router.post('/visits/:id/evidence', VerificationController.uploadEvidence);
router.get('/visits/:id/evidence',  VerificationController.getEvidence);

export default router;
