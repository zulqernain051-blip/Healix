import { PatientRepository } from '../../patient.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class AddEmergencyContactUseCase {
  constructor(private readonly patientRepository = PatientRepository) {}

  async execute(patientId: string, data: any) {
    const patient = await this.patientRepository.findPatientById(patientId);
    if (!patient) {
      throw new AppError('Patient profile not found', HTTP_STATUS.NOT_FOUND);
    }
    return this.patientRepository.addEmergencyContact(patientId, data);
  }
}
