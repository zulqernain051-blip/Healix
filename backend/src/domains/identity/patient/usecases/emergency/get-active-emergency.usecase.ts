import { EmergencyRepository } from '../../../../care/emergency/emergency.repository';

export class GetActiveEmergencyUseCase {
  async execute(patientId: string) {
    const dispatch = await EmergencyRepository.findActiveDispatchForPatient(patientId);
    return dispatch;
  }
}
