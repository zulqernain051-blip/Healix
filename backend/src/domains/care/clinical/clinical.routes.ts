import { Router } from 'express';
import { protect } from '../../../common/middleware/authMiddleware';
import { ClinicalController } from './clinical.controller';

const router = Router();

router.use(protect);

router.post('/clinical/risk-assess', ClinicalController.performRiskAssessment);
router.post('/clinical/knowledge-query', ClinicalController.queryClinicalKnowledge);
router.get('/visits/:id/ai-summary', ClinicalController.getVisitAiSummary);
router.get('/patients/:patientId/compliance', ClinicalController.getComplianceMetrics);

export default router;
