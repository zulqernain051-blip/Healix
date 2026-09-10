import { PatientRepository } from '../../patient.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class GetProfileUseCase {
  constructor(private readonly patientRepository = PatientRepository) {}

  async execute(patientId: string) {
    const patient = await this.patientRepository.findPatientById(patientId);
    if (!patient) {
      throw new AppError('Patient profile not found', HTTP_STATUS.NOT_FOUND);
    }
    return patient;
  }
}
