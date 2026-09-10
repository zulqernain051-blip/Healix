import { PatientRepository } from '../../patient.repository';
import { VisitRepository } from '../../../../care/visit/visit.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class GetVisitsHistoryUseCase {
  constructor(
    private readonly patientRepository = PatientRepository,
    private readonly visitRepository = VisitRepository
  ) {}

  async execute(patientId: string) {
    const patient = await this.patientRepository.findPatientById(patientId);
    if (!patient) throw new AppError('Patient profile not found', HTTP_STATUS.NOT_FOUND);
    return this.visitRepository.findPatientVisits(patientId);
  }
}
