import { ClinicalRepository } from '../../clinical.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';

export class LogMedicationDoseUseCase {
  constructor(private readonly clinicalRepository = ClinicalRepository) {}

  async execute(medicationId: string, patientId: string) {
    const med = await this.clinicalRepository.findMedicationById(medicationId);
    if (!med) throw new AppError('Medication not found', HTTP_STATUS.NOT_FOUND);

    return this.clinicalRepository.createMedicationLog(medicationId, patientId);
  }
}


