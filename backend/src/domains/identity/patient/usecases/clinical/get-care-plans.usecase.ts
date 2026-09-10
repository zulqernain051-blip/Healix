import { PatientRepository } from '../../patient.repository';
import { CareRepository } from '../../../../care/requests/care.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class GetCarePlansUseCase {
  constructor(
    private readonly patientRepository = PatientRepository,
    private readonly careRepository = CareRepository
  ) {}

  async execute(patientId: string) {
    const patient = await this.patientRepository.findPatientById(patientId);
    if (!patient) throw new AppError('Patient profile not found', HTTP_STATUS.NOT_FOUND);
    return this.careRepository.findPatientCarePlans(patientId);
  }
}
