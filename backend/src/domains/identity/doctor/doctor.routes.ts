import { Router } from 'express';
import { protect } from '../../../common/middleware/authMiddleware';
import { DoctorController } from './doctor.controller';

const router = Router();

// Apply auth middleware to all endpoints
router.use(protect);

// Queue APIs
router.get('/doctors/queue', DoctorController.getQueue);
router.get('/doctors/queue/high-risk', DoctorController.getHighRiskQueue);
router.put('/cases/:caseId/accept-emergency', DoctorController.acceptEmergencyCase);
router.put('/cases/:caseId/start-review', DoctorController.startCaseReview);
router.put('/cases/:caseId/resolve', DoctorController.resolveCase);

// Consolidated case details
router.get('/cases/:caseId/review', DoctorController.getCaseReview);

// Consultation/Opinion list
router.get('/doctors/list', DoctorController.getDoctors);
router.post('/cases/:caseId/second-opinion', DoctorController.requestSecondOpinion);

// Diagnosis
router.post('/cases/:caseId/diagnosis', DoctorController.submitDiagnosis);
router.get('/cases/:caseId/diagnosis', DoctorController.getDiagnosisHistory);

// Care plans
router.post('/cases/:caseId/care-plan', DoctorController.submitCarePlan);

// Prescriptions
router.post('/cases/:caseId/prescriptions', DoctorController.submitPrescription);
router.post('/prescriptions/:id/supersede', DoctorController.supersedePrescription);

// Decisions
router.post('/cases/:caseId/decision', DoctorController.submitClinicalDecision);
router.post('/cases/:caseId/follow-up', DoctorController.scheduleFollowUp);

// AI Feedback CDSS
router.post('/cases/:caseId/ai-feedback', DoctorController.submitAiFeedback);

export default router;
