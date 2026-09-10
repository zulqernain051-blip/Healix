import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';
import { CareRepository } from '../../care.repository';
import { VisitRepository } from '../../../visit/visit.repository';

export class ScheduleOneOffUseCase {
  constructor(private readonly careRepository = CareRepository,
    private readonly visitRepository = VisitRepository) {}

  async execute(requestId: string, scheduledAt: string) {
    const request = await this.careRepository.findRequestById(requestId);
    if (!request) throw new AppError('', HTTP_STATUS.NOT_FOUND);

    return this.visitRepository.createVisit(requestId, new Date(scheduledAt));
  }
}


