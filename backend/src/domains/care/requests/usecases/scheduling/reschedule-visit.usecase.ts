import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';
import { CareRepository } from '../../care.repository';
import { VisitRepository } from '../../../visit/visit.repository';

export class RescheduleVisitUseCase {
  constructor(private readonly careRepository = CareRepository,
    private readonly visitRepository = VisitRepository) {}

  async execute(visitId: string, newScheduledAt: string) {
    const visit = await this.visitRepository.findVisitById(visitId);
    if (!visit) throw new AppError('', HTTP_STATUS.NOT_FOUND);

    return this.careRepository.updateCareRequestScheduledAt(visit.requestId, new Date(newScheduledAt));
  }
}


