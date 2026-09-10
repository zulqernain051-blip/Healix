import { AdmissionRepository } from './admission.repository';

export class AdmissionService {
  static async updateAdmissionStatus(admissionId: string, status: 'REQUESTED' | 'ADMITTED' | 'DISCHARGED', dischargeNotes?: string) {
    return AdmissionRepository.updateAdmissionStatusAndCreateFollowUp(admissionId, status, dischargeNotes);
  }
}
