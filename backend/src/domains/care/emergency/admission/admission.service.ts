import { AdmissionRepository } from './admission.repository';
import { DispatchService } from '../dispatch/dispatch.service';
import { AppError } from '../../../../common/errors/AppError';
import { PatientActor } from '../../../identity/patient/usecases/profile/assert-patient-access.usecase';

export class AdmissionService {
  static async updateAdmissionStatus(admissionId: string, status: 'REQUESTED' | 'ADMITTED' | 'DISCHARGED', actor: PatientActor & { doctor?: { id: string } | null }, dischargeNotes?: string) {
    if (!['REQUESTED', 'ADMITTED', 'DISCHARGED'].includes(status)) throw new AppError('Invalid admission status', 400);
    const admission = await AdmissionRepository.findById(admissionId);
    if (!admission) throw new AppError('Admission not found', 404);
    await DispatchService.assertAccess(admission.dispatchId, actor, true);
    return AdmissionRepository.updateAdmissionStatusAndCreateFollowUp(admissionId, status, dischargeNotes);
  }
}
