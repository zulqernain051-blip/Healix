import { Request, Response, NextFunction } from 'express';
import { ClinicalService } from './clinical.service';
import { riskAssessSchema, ragQuerySchema } from './clinical.validation';
import { GetVisitDetailUseCase } from '../visit/lifecycle/get-visit-detail.usecase';
import { AppError } from '../../../common/errors/AppError';

export class ClinicalController {
  public static async performRiskAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = riskAssessSchema.parse(req.body);
      const actor = (req as any).user;
      if (payload.visitId) {
        const visit = await new GetVisitDetailUseCase().execute(payload.visitId, actor);
        if (visit.request.patientId !== payload.patientId) throw new AppError('Patient does not match visit', 400);
      } else if (actor.role !== 'ADMIN' && actor.patient?.id !== payload.patientId) {
        throw new AppError('You do not have access to this patient', 403);
      }
      const simulateTimeout = req.query.simulateTimeout === 'true';
      const result = await ClinicalService.performRiskAssessment(payload, simulateTimeout);
      res.json({ success: true, data: result });
    } catch (err: any) {
      next(err);
    }
  }

  public static async queryClinicalKnowledge(req: Request, res: Response) {
    try {
      const { query } = ragQuerySchema.parse(req.body);
      const results = await ClinicalService.queryClinicalKnowledge(query);
      res.json({ success: true, data: results });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async getVisitAiSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // Visit ID
      const summary = await ClinicalService.getVisitAiSummary(id, (req as any).user);
      res.json({ success: true, data: summary });
    } catch (err: any) {
      next(err);
    }
  }

  public static async getComplianceMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const { GetComplianceMetricsUseCase } = await import('./usecases/compliance/get-compliance-metrics.usecase');
      const usecase = new GetComplianceMetricsUseCase();
      const metrics = await usecase.execute(patientId, (req as any).user);
      res.json({ success: true, data: metrics });
    } catch (err: any) {
      next(err);
    }
  }
}
