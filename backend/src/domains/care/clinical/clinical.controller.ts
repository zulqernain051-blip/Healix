import { Request, Response } from 'express';
import { ClinicalService } from './clinical.service';
import { riskAssessSchema, ragQuerySchema } from './clinical.validation';

export class ClinicalController {
  public static async performRiskAssessment(req: Request, res: Response) {
    try {
      const payload = riskAssessSchema.parse(req.body);
      const simulateTimeout = req.query.simulateTimeout === 'true';
      const result = await ClinicalService.performRiskAssessment(payload, simulateTimeout);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
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

  public static async getVisitAiSummary(req: Request, res: Response) {
    try {
      const { id } = req.params; // Visit ID
      const summary = await ClinicalService.getVisitAiSummary(id);
      res.json({ success: true, data: summary });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async getComplianceMetrics(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const { GetComplianceMetricsUseCase } = await import('./usecases/compliance/get-compliance-metrics.usecase');
      const usecase = new GetComplianceMetricsUseCase();
      const metrics = await usecase.execute(patientId);
      res.json({ success: true, data: metrics });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
