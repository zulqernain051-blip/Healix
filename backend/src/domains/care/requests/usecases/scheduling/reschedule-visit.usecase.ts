import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';
import { CareRepository } from '../../care.repository';
import { VisitRepository } from '../../../visit/visit.repository';

export class RescheduleVisitUseCase {
  constructor(private readonly careRepository = CareRepository,
    private readonly visitRepository = VisitRepository) {}

  async execute(visitId: string, newScheduledAt: string) {
    if (!Number.isFinite(new Date(newScheduledAt).getTime())) {
      throw new AppError('Invalid scheduled date', HTTP_STATUS.BAD_REQUEST);
    }
    const visit = await this.visitRepository.findVisitById(visitId);
    if (!visit) throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);

    return this.careRepository.updateCareRequestScheduledAt(visit.requestId, new Date(newScheduledAt));
  }
}


