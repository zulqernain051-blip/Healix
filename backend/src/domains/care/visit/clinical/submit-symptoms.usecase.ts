import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';
import { VisitRepository } from '../visit.repository';
import { ClinicalRepository } from '../../clinical/clinical.repository';

export class SubmitSymptomsUseCase {
  constructor(
    private readonly visitRepository = VisitRepository,
    private readonly clinicalRepository = ClinicalRepository
  ) {}

  async execute(input: { visitId: string; nurseId: string; symptoms: any[] }) {
    const visit = await this.visitRepository.findVisitById(input.visitId);
    if (!visit) {
      throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
    }
    if (visit.nurseId !== input.nurseId) {
      throw new AppError('Invalid visit status or permission', HTTP_STATUS.BAD_REQUEST);
    }
    if (visit.status !== 'IN_PROGRESS') {
      throw new AppError('Invalid visit status or permission', HTTP_STATUS.BAD_REQUEST);
    }

    // Future Domain Event: SymptomsSubmitted
    return this.clinicalRepository.createSymptoms(input.visitId, input.symptoms);
  }
}

