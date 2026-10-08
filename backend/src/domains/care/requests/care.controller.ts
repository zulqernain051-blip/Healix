import { AssertPatientAccessUseCase } from '../../identity/patient/usecases/profile/assert-patient-access.usecase';
import { CompleteMilestoneUseCase } from './usecases/milestones/complete-milestone.usecase';
import { Request, Response, NextFunction } from 'express';
import {
  priorityOverrideSchema,
  scheduleOneOffSchema,
  medicationLogSchema
} from './care.validation';

// Requests
import { ListCareRequestsUseCase } from './usecases/requests/list-care-requests.usecase';
import { OverridePriorityUseCase } from './usecases/requests/override-priority.usecase';

// Scheduling
import { ScheduleOneOffUseCase } from './usecases/scheduling/schedule-one-off.usecase';
import { RescheduleVisitUseCase } from './usecases/scheduling/reschedule-visit.usecase';
import { CancelVisitUseCase } from './usecases/scheduling/cancel-visit.usecase';


// Milestones
import { GetOverdueMilestonesUseCase } from './usecases/milestones/get-overdue-milestones.usecase';

// Clinical & Compliance
import { GetComplianceMetricsUseCase } from '../clinical/usecases/compliance/get-compliance-metrics.usecase';
import { LogMedicationDoseUseCase } from '../clinical/usecases/medication/log-medication-dose.usecase';
import { GetMedicationLogsUseCase } from '../clinical/usecases/medication/get-medication-logs.usecase';

const listCareRequestsUseCase = new ListCareRequestsUseCase();
const overridePriorityUseCase = new OverridePriorityUseCase();
const scheduleOneOffUseCase = new ScheduleOneOffUseCase();
const rescheduleVisitUseCase = new RescheduleVisitUseCase();
const cancelVisitUseCase = new CancelVisitUseCase();

const getOverdueMilestonesUseCase = new GetOverdueMilestonesUseCase();
const completeMilestoneUseCase = new CompleteMilestoneUseCase();
const getComplianceMetricsUseCase = new GetComplianceMetricsUseCase();
const logMedicationDoseUseCase = new LogMedicationDoseUseCase();
const getMedicationLogsUseCase = new GetMedicationLogsUseCase();

export class CareController {
  public static async getNormalizedRequests(_req: Request, res: Response, next: NextFunction) {
    try {
      const list = await listCareRequestsUseCase.execute();
      res.json({ success: true, data: list });
    } catch (err: any) {
      next(err);
    }
  }

  public static async overridePriority(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { priority } = priorityOverrideSchema.parse(req.body);
      const result = await overridePriorityUseCase.execute(id, priority);
      res.json({ success: true, data: result });
    } catch (err: any) {
      next(err);
    }
  }

  public static async scheduleOneOff(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId, scheduledAt } = scheduleOneOffSchema.parse(req.body);
      const visit = await scheduleOneOffUseCase.execute(requestId, scheduledAt);
      res.json({ success: true, data: visit });
    } catch (err: any) {
      next(err);
    }
  }

  public static async rescheduleVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { scheduledAt } = scheduleOneOffSchema.pick({ scheduledAt: true }).parse(req.body);
      if (!scheduledAt) {
        res.status(400).json({ success: false, message: 'scheduledAt date is required' });
        return;
      }

      const result = await rescheduleVisitUseCase.execute(id, scheduledAt);
      res.json({ success: true, data: result });
    } catch (err: any) {
      next(err);
    }
  }

  public static async cancelVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleteSeries = req.query.deleteSeries === 'true';
      const result = await cancelVisitUseCase.execute(id, deleteSeries);
      res.json({ success: true, data: result });
    } catch (err: any) {
      next(err);
    }
  }

  public static async getOverdueMilestones(_req: Request, res: Response, next: NextFunction) {
    try {
      const list = await getOverdueMilestonesUseCase.execute();
      res.json({ success: true, data: list });
    } catch (err: any) {
      next(err);
    }
  }

  public static async getComplianceMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // Patient ID
      const metrics = await getComplianceMetricsUseCase.execute(id, (req as any).user);
      res.json({ success: true, data: metrics });
    } catch (err: any) {
      next(err);
    }
  }

  public static async logMedicationDose(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // Patient ID
      const { medicationId } = medicationLogSchema.parse(req.body);
      await AssertPatientAccessUseCase.execute(id, (req as any).user);
      const log = await logMedicationDoseUseCase.execute(medicationId, id);
      res.json({ success: true, data: log });
    } catch (err: any) {
      next(err);
    }
  }

  public static async getMedicationLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // Patient ID
      await AssertPatientAccessUseCase.execute(id, (req as any).user);
      const list = await getMedicationLogsUseCase.execute(id);
      res.json({ success: true, data: list });
    } catch (err: any) {
      next(err);
    }
  }

  public static async completeMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: milestoneId } = req.params;
      const actorId = (req as any).user?.id;
      
      const updatedPlan = await completeMilestoneUseCase.execute(milestoneId, actorId);
      res.json({ success: true, data: updatedPlan });
    } catch (err: any) {
      next(err);
    }
  }

}
