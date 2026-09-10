import { Router } from 'express';
import { protect } from '../../../common/middleware/authMiddleware';
import { VisitController } from './visit.controller';

const router = Router();

// Apply auth protection to all routes
router.use(protect);

// Visit management
router.get('/nurses/:nurseId/visits', VisitController.getNurseVisits);
router.get('/visits/:visitId', VisitController.getVisitDetail);
router.post('/visits/:visitId/complete', VisitController.completeVisit);
router.put('/visits/:visitId/notes', VisitController.saveNotes);

// Verification and collection
router.post('/visits/:visitId/vitals', VisitController.submitVitals);
router.post('/visits/:visitId/symptoms', VisitController.submitSymptoms);
router.post('/visits/:visitId/clinical-remarks', VisitController.submitClinicalRemarks);

// Reviews, Scores, and Badges
router.post('/visits/:visitId/rating', VisitController.submitReview);
router.get('/nurses/:nurseId/reviews', VisitController.getNurseReviews);
router.get('/nurses/:nurseId/score', VisitController.getNurseScore);
router.get('/nurses/:nurseId/badges', VisitController.getNurseBadges);

// Vacations inline routes
router.post('/nurses/:nurseId/vacations', VisitController.createVacation);
router.get('/nurses/:nurseId/vacations', VisitController.getVacations);
router.delete('/nurses/:nurseId/vacations/:vacationId', VisitController.deleteVacation);

export default router;
