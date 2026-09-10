import { PatientRepository } from '../../patient.repository';
import { ClinicalRepository } from '../../../../care/clinical/clinical.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class AddChronicConditionUseCase {
  constructor(
    private readonly patientRepository = PatientRepository,
    private readonly clinicalRepository = ClinicalRepository
  ) {}

  async execute(patientId: string, data: any) {
    const patient = await this.patientRepository.findPatientById(patientId);
    if (!patient) throw new AppError('Patient profile not found', HTTP_STATUS.NOT_FOUND);
    return this.clinicalRepository.addChronicCondition(patientId, data);
  }
}
