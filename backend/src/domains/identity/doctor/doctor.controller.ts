import { ResolveCaseUseCase } from '../../care/clinical/usecases/case/resolve-case.usecase';
import { Request, Response } from 'express';
import {
  secondOpinionSchema,
  diagnosisSchema,
  carePlanSchema,
  prescriptionSchema,
  decisionSchema,
  aiFeedbackSchema
} from './doctor.validation';

// Queue Use Cases
import { GetQueueUseCase } from './usecases/queue/get-queue.usecase';
import { GetHighRiskQueueUseCase } from './usecases/queue/get-high-risk-queue.usecase';
import { AcceptEmergencyCaseUseCase } from './usecases/queue/accept-emergency-case.usecase';

// Review Use Cases
import { StartCaseReviewUseCase } from './usecases/review/start-case-review.usecase';
import { GetCaseReviewUseCase } from './usecases/review/get-case-review.usecase';
import { RequestSecondOpinionUseCase } from './usecases/review/request-second-opinion.usecase';
import { SubmitClinicalDecisionUseCase } from './usecases/review/submit-clinical-decision.usecase';
import { SubmitAiFeedbackUseCase } from './usecases/review/submit-ai-feedback.usecase';
import { GetDoctorsUseCase } from './usecases/review/get-doctors.usecase';

// Clinical Use Cases
import { SubmitDiagnosisUseCase } from './usecases/clinical/submit-diagnosis.usecase';
import { GetDiagnosisHistoryUseCase } from './usecases/clinical/get-diagnosis-history.usecase';
import { SubmitCarePlanUseCase } from './usecases/clinical/submit-care-plan.usecase';
import { ScheduleFollowUpUseCase } from './usecases/clinical/schedule-follow-up.usecase';
import { SubmitPrescriptionUseCase } from './usecases/clinical/submit-prescription.usecase';
import { SupersedePrescriptionUseCase } from './usecases/clinical/supersede-prescription.usecase';

// Home Visit Use Cases

// Instantiate Use Cases
const getQueueUseCase = new GetQueueUseCase();
const getHighRiskQueueUseCase = new GetHighRiskQueueUseCase();
const startCaseReviewUseCase = new StartCaseReviewUseCase();
const resolveCaseUseCase = new ResolveCaseUseCase();
const getCaseReviewUseCase = new GetCaseReviewUseCase();
const requestSecondOpinionUseCase = new RequestSecondOpinionUseCase();
const submitClinicalDecisionUseCase = new SubmitClinicalDecisionUseCase();
const submitAiFeedbackUseCase = new SubmitAiFeedbackUseCase();
const getDoctorsUseCase = new GetDoctorsUseCase();
const submitDiagnosisUseCase = new SubmitDiagnosisUseCase();
const getDiagnosisHistoryUseCase = new GetDiagnosisHistoryUseCase();
const submitCarePlanUseCase = new SubmitCarePlanUseCase();
const scheduleFollowUpUseCase = new ScheduleFollowUpUseCase();
const submitPrescriptionUseCase = new SubmitPrescriptionUseCase();
const supersedePrescriptionUseCase = new SupersedePrescriptionUseCase();
const acceptEmergencyCaseUseCase = new AcceptEmergencyCaseUseCase();

export class DoctorController {
  public static async getQueue(req: Request, res: Response) {
    try {
      const doctorId = (req as any).user?.doctor?.id;
      if (!doctorId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const queue = await getQueueUseCase.execute(doctorId);
      res.json({ success: true, data: queue });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async acceptEmergencyCase(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const doctorId = (req as any).user?.doctor?.id;
      if (!doctorId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }
      const result = await acceptEmergencyCaseUseCase.execute(caseId, doctorId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async getHighRiskQueue(req: Request, res: Response) {
    try {
      const doctorId = (req as any).user?.doctor?.id;
      if (!doctorId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const queue = await getHighRiskQueueUseCase.execute(doctorId);
      res.json({ success: true, data: queue });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async startCaseReview(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const doctorId = (req as any).user?.doctor?.id;
      if (!doctorId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const result = await startCaseReviewUseCase.execute(caseId, doctorId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async getCaseReview(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const doctorId = (req as any).user?.doctor?.id;
      if (!doctorId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const payload = await getCaseReviewUseCase.execute(caseId, doctorId);
      res.json({ success: true, data: payload });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getDoctors(req: Request, res: Response) {
    try {
      const doctorId = (req as any).user?.doctor?.id;
      if (!doctorId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const list = await getDoctorsUseCase.execute(doctorId);
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async requestSecondOpinion(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const requestingDoctorId = (req as any).user?.doctor?.id;
      if (!requestingDoctorId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const validated = secondOpinionSchema.parse(req.body);
      const result = await requestSecondOpinionUseCase.execute(caseId, requestingDoctorId, validated.consultedDoctorId);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async submitDiagnosis(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const doctorId = (req as any).user?.doctor?.id;
      if (!doctorId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const validated = diagnosisSchema.parse(req.body);
      const result = await submitDiagnosisUseCase.execute(caseId, doctorId, validated);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async getDiagnosisHistory(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const result = await getDiagnosisHistoryUseCase.execute(caseId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async submitCarePlan(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const doctorId = (req as any).user?.doctor?.id;
      if (!doctorId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const validated = carePlanSchema.parse(req.body);
      const result = await submitCarePlanUseCase.execute(caseId, doctorId, validated);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async submitPrescription(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const doctorId = (req as any).user?.doctor?.id;
      if (!doctorId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const validated = prescriptionSchema.parse(req.body);
      const result = await submitPrescriptionUseCase.execute(caseId, doctorId, validated);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      if (err.status === 409) {
        res.status(409).json({ success: false, message: err.message, data: err.data });
        return;
      }
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async supersedePrescription(req: Request, res: Response) {
    try {
      const { prescriptionId } = req.params;
      const doctorId = (req as any).user?.doctor?.id;
      if (!doctorId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const validated = prescriptionSchema.parse(req.body);
      const result = await supersedePrescriptionUseCase.execute(prescriptionId, doctorId, validated);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      if (err.status === 409) {
        res.status(409).json({ success: false, message: err.message, data: err.data });
        return;
      }
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async submitClinicalDecision(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const doctorId = (req as any).user?.doctor?.id;
      if (!doctorId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const validated = decisionSchema.parse(req.body);
      const result = await submitClinicalDecisionUseCase.execute(caseId, doctorId, validated);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async submitAiFeedback(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const doctorId = (req as any).user?.doctor?.id;
      if (!doctorId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const validated = aiFeedbackSchema.parse(req.body);
      const result = await submitAiFeedbackUseCase.execute(caseId, doctorId, validated.targetType, validated.comment);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  

  public static async resolveCase(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const { summary } = req.body;
      const doctorId = (req as any).user?.doctor?.id;
      if (!doctorId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }
      
      const result = await resolveCaseUseCase.execute(caseId, doctorId, summary);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }


  public static async scheduleFollowUp(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const doctorId = (req as any).user?.doctor?.id;
      if (!doctorId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }
      const data = {
        targetDate: new Date(req.body.targetDate),
        instructions: req.body.instructions,
        preferCurrentNurse: req.body.preferCurrentNurse
      };
      const result = await scheduleFollowUpUseCase.execute(caseId, doctorId, data);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

}