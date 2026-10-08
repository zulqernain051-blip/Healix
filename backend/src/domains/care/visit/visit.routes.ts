import { Router } from 'express';
import offlineClinicalRouter from './offline-clinical.routes';
import visitEvidenceRouter from './visit-evidence.routes';
import { protect } from '../../../common/middleware/authMiddleware';
import { VisitController } from './visit.controller';

import { prisma } from '../../../common/config/database';
import { asyncHandler } from '../../../common/middleware/asyncHandler';
import { AppError } from '../../../common/errors/AppError';
const router = Router();

// Apply auth protection to all routes
router.use(protect);
router.use(offlineClinicalRouter);
router.use(visitEvidenceRouter);

router.post('/visits/:visitId/accept', asyncHandler(async (req, res) => {
  const nurseId = (req as any).user?.nurse?.id;
  if (!nurseId) throw new AppError('Nurse access required', 403);
  const changed = await prisma.visit.updateMany({ where: { id: req.params.visitId, nurseId, status: 'SCHEDULED' }, data: { status: 'ACCEPTED', acceptedAt: new Date() } });
  if (!changed.count) throw new AppError('Only your scheduled visits can be accepted', 409);
  res.json({ success: true, data: { status: 'ACCEPTED' } });
}));
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
