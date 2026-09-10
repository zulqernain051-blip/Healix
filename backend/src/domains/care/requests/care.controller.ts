import { CompleteMilestoneUseCase } from './usecases/milestones/complete-milestone.usecase';
import { Request, Response } from 'express';
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
  // We cannot modify endpoints, but there is no explicit create endpoint here!
  // Wait, the CareService had createNormalizedRequest, but CareController did not expose it?
  // Let's check original CareController. It didn't have createNormalizedRequest!
  // It only had getNormalizedRequests.
  // We will leave createNormalizedRequest out of the Controller if it wasn't there.

  public static async getNormalizedRequests(_req: Request, res: Response) {
    try {
      const list = await listCareRequestsUseCase.execute();
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async overridePriority(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { priority } = priorityOverrideSchema.parse(req.body);
      const result = await overridePriorityUseCase.execute(id, priority);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async scheduleOneOff(req: Request, res: Response) {
    try {
      const { requestId, scheduledAt } = scheduleOneOffSchema.parse(req.body);
      const visit = await scheduleOneOffUseCase.execute(requestId, scheduledAt);
      res.json({ success: true, data: visit });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async rescheduleVisit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { scheduledAt } = req.body;
      if (!scheduledAt) {
        res.status(400).json({ success: false, message: 'scheduledAt date is required' });
        return;
      }

      const result = await rescheduleVisitUseCase.execute(id, scheduledAt);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async cancelVisit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleteSeries = req.query.deleteSeries === 'true';
      const result = await cancelVisitUseCase.execute(id, deleteSeries);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async getOverdueMilestones(_req: Request, res: Response) {
    try {
      const list = await getOverdueMilestonesUseCase.execute();
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getComplianceMetrics(req: Request, res: Response) {
    try {
      const { id } = req.params; // Patient ID
      const metrics = await getComplianceMetricsUseCase.execute(id);
      res.json({ success: true, data: metrics });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async logMedicationDose(req: Request, res: Response) {
    try {
      const { id } = req.params; // Patient ID
      const { medicationId } = medicationLogSchema.parse(req.body);
      const log = await logMedicationDoseUseCase.execute(medicationId, id);
      res.json({ success: true, data: log });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async getMedicationLogs(req: Request, res: Response) {
    try {
      const { id } = req.params; // Patient ID
      const list = await getMedicationLogsUseCase.execute(id);
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async completeMilestone(req: Request, res: Response) {
    try {
      const { id: milestoneId } = req.params;
      const actorId = (req as any).user?.id;
      
      const updatedPlan = await completeMilestoneUseCase.execute(milestoneId, actorId);
      res.json({ success: true, data: updatedPlan });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

}
