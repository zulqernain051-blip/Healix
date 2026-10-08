import { Router } from 'express';
import { protect } from '../../../common/middleware/authMiddleware';
import { DoctorController } from './doctor.controller';

import homeVisitsRouter from './home-visits.routes';

const router = Router();
const verifiedDoctor = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'DOCTOR' || req.user.doctor?.verificationStatus !== 'VERIFIED') {
    res.status(403).json({ success: false, message: 'Verified doctor access required' });
    return;
  }
  next();
};

// Apply auth middleware to all endpoints
router.use(protect);
router.use(homeVisitsRouter);

// Queue APIs
router.get('/doctors/queue', verifiedDoctor, DoctorController.getQueue);
router.get('/doctors/queue/high-risk', verifiedDoctor, DoctorController.getHighRiskQueue);
router.put('/cases/:caseId/accept-emergency', verifiedDoctor, DoctorController.acceptEmergencyCase);
router.put('/cases/:caseId/start-review', verifiedDoctor, DoctorController.startCaseReview);
router.put('/cases/:caseId/resolve', verifiedDoctor, DoctorController.resolveCase);

// Consolidated case details
router.get('/cases/:caseId/review', verifiedDoctor, DoctorController.getCaseReview);

// Consultation/Opinion list
router.get('/doctors/list', verifiedDoctor, DoctorController.getDoctors);
router.post('/cases/:caseId/second-opinion', verifiedDoctor, DoctorController.requestSecondOpinion);

// Diagnosis
router.post('/cases/:caseId/diagnosis', verifiedDoctor, DoctorController.submitDiagnosis);
router.get('/cases/:caseId/diagnosis', verifiedDoctor, DoctorController.getDiagnosisHistory);

// Care plans
router.post('/cases/:caseId/care-plan', verifiedDoctor, DoctorController.submitCarePlan);

// Prescriptions
router.post('/cases/:caseId/prescriptions', verifiedDoctor, DoctorController.submitPrescription);
router.post('/prescriptions/:id/supersede', verifiedDoctor, DoctorController.supersedePrescription);

// Decisions
router.post('/cases/:caseId/decision', verifiedDoctor, DoctorController.submitClinicalDecision);
router.post('/cases/:caseId/follow-up', verifiedDoctor, DoctorController.scheduleFollowUp);

// AI Feedback CDSS
router.post('/cases/:caseId/ai-feedback', verifiedDoctor, DoctorController.submitAiFeedback);

export default router;
