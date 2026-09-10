import { Request, Response } from 'express';
import { VisitRepository } from './visit.repository';
import {
  GetNurseVisitsUseCase,
  CompleteVisitUseCase,
  SaveNotesUseCase
} from './lifecycle';

import {
  SubmitVitalsUseCase,
  SubmitSymptomsUseCase,
  SubmitClinicalRemarksUseCase
} from './clinical';
import { VerificationService } from './verification/verification.service';
import { NursePerformanceRepository } from '../../identity/nurse/repositories/nurse-performance.repository';
import {
  SubmitReviewUseCase,
  GetNurseReviewsUseCase,
  GetNurseScoreUseCase,
  GetNurseBadgesUseCase
} from './performance';
import {
  CreateVacationUseCase,
  GetVacationsUseCase,
  DeleteVacationUseCase
} from './scheduling';

import {
  vacationSchema,
  visitNotesSchema,

  vitalsSchema,
  symptomSchema,
  clinicalRemarkSchema,
  ratingSchema
} from './visit.validation';

export class VisitController {
  public static async getNurseVisits(req: Request, res: Response) {
    try {
      const { nurseId } = req.params;
      const useCase = new GetNurseVisitsUseCase();
      const visits = await useCase.execute({ nurseId });
      res.json({ success: true, data: visits });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getVisitDetail(req: Request, res: Response) {
    try {
      const { visitId } = req.params;
      const visit = await VisitRepository.findVisitById(visitId);
      if (!visit) {
        res.status(404).json({ success: false, message: 'Visit not found' });
        return;
      }
      res.json({ success: true, data: visit });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }


  public static async completeVisit(req: Request, res: Response) {
    try {
      const { visitId } = req.params;
      const nurseId = (req as any).user?.nurse?.id;
      if (!nurseId) {
        res.status(403).json({ success: false, message: 'Forbidden. User role: ' + (req as any).user?.role + ', hasNurse: ' + !!(req as any).user?.nurse });
        return;
      }

      const result = await VerificationService.completeVisit(visitId, nurseId);

      // Only compute scores if the visit is actually completed (not pending patient confirmation)
      if ((result as any).status !== 'PENDING_PATIENT_CONFIRMATION') {
        await NursePerformanceRepository.computeAndUpsertNurseScore(nurseId);
        await NursePerformanceRepository.awardBadgesIfEligible(nurseId);
      }

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async saveNotes(req: Request, res: Response) {
    try {
      const { visitId } = req.params;
      const nurseId = (req as any).user?.nurse?.id;
      if (!nurseId) {
        res.status(403).json({ success: false, message: 'Forbidden. User role: ' + (req as any).user?.role + ', hasNurse: ' + !!(req as any).user?.nurse });
        return;
      }

      visitNotesSchema.parse(req.body);
      const useCase = new SaveNotesUseCase();
      const result = await useCase.execute({ visitId, nurseId, notes: req.body.notes });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }


  public static async submitVitals(req: Request, res: Response) {
    try {
      const { visitId } = req.params;
      const nurseId = (req as any).user?.nurse?.id;
      if (!nurseId) {
        res.status(403).json({ success: false, message: 'Forbidden. User role: ' + (req as any).user?.role + ', hasNurse: ' + !!(req as any).user?.nurse });
        return;
      }

      vitalsSchema.parse(req.body);
      const useCase = new SubmitVitalsUseCase();
      const result = await useCase.execute({ visitId, nurseId, data: req.body });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async submitSymptoms(req: Request, res: Response) {
    try {
      const { visitId } = req.params;
      const nurseId = (req as any).user?.nurse?.id;
      if (!nurseId) {
        res.status(403).json({ success: false, message: 'Forbidden. User role: ' + (req as any).user?.role + ', hasNurse: ' + !!(req as any).user?.nurse });
        return;
      }

      symptomSchema.parse(req.body);
      const useCase = new SubmitSymptomsUseCase();
      const result = await useCase.execute({ visitId, nurseId, symptoms: req.body.symptoms });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async submitClinicalRemarks(req: Request, res: Response) {
    try {
      const { visitId } = req.params;
      const nurseId = (req as any).user?.nurse?.id;
      if (!nurseId) {
        res.status(403).json({ success: false, message: 'Forbidden. User role: ' + (req as any).user?.role + ', hasNurse: ' + !!(req as any).user?.nurse });
        return;
      }

      clinicalRemarkSchema.parse(req.body);
      const useCase = new SubmitClinicalRemarksUseCase();
      const result = await useCase.execute({ 
        visitId, 
        nurseId, 
        remarksText: req.body.remarksText, 
        confidenceLevel: req.body.confidenceLevel 
      });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async submitReview(req: Request, res: Response) {
    try {
      const { visitId } = req.params;
      const patientId = (req as any).user?.patient?.id;
      if (!patientId) {
        res.status(403).json({ success: false, message: 'Forbidden: Only patients can review visits' });
        return;
      }

      ratingSchema.parse(req.body);
      const useCase = new SubmitReviewUseCase();
      const result = await useCase.execute({
        visitId, 
        patientId, 
        stars: req.body.stars, 
        reviewText: req.body.reviewText, 
        recommend: req.body.recommend
      });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async getNurseReviews(req: Request, res: Response) {
    try {
      const { nurseId } = req.params;
      const useCase = new GetNurseReviewsUseCase();
      const reviews = await useCase.execute({ nurseId });
      res.json({ success: true, data: reviews });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getNurseScore(req: Request, res: Response) {
    try {
      const { nurseId } = req.params;
      const useCase = new GetNurseScoreUseCase();
      const score = await useCase.execute({ nurseId });
      res.json({ success: true, data: score });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getNurseBadges(req: Request, res: Response) {
    try {
      const { nurseId } = req.params;
      const useCase = new GetNurseBadgesUseCase();
      const badges = await useCase.execute({ nurseId });
      res.json({ success: true, data: badges });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
  public static async createVacation(req: Request, res: Response) {
    try {
      const { nurseId } = req.params;
      const userNurseId = (req as any).user?.nurse?.id;
      if (userNurseId !== nurseId) {
        res.status(403).json({ success: false, message: 'Forbidden. User role: ' + (req as any).user?.role + ', hasNurse: ' + !!(req as any).user?.nurse });
        return;
      }

      const { startDate, endDate, reason } = vacationSchema.parse(req.body);

      const useCase = new CreateVacationUseCase();
      const vacation = await useCase.execute({
        nurseId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason
      });

      res.json({ success: true, data: vacation });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async getVacations(req: Request, res: Response) {
    try {
      const { nurseId } = req.params;
      const useCase = new GetVacationsUseCase();
      const vacations = await useCase.execute({ nurseId });
      res.json({ success: true, data: vacations });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async deleteVacation(req: Request, res: Response) {
    try {
      const { nurseId, vacationId } = req.params;
      const userNurseId = (req as any).user?.nurse?.id;
      if (userNurseId !== nurseId) {
        res.status(403).json({ success: false, message: 'Forbidden. User role: ' + (req as any).user?.role + ', hasNurse: ' + !!(req as any).user?.nurse });
        return;
      }

      const useCase = new DeleteVacationUseCase();
      await useCase.execute({ vacationId, nurseId });

      res.json({ success: true, message: 'Vacation deleted successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

