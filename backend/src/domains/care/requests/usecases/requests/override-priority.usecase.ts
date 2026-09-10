import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';
import { CareRepository } from '../../care.repository';

export class OverridePriorityUseCase {
  constructor(private readonly careRepository = CareRepository) {}

  async execute(requestId: string, priority: string) {
    const request = await this.careRepository.findRequestById(requestId);
    if (!request) throw new AppError('', HTTP_STATUS.NOT_FOUND);

    return this.careRepository.updateRequestPriority(requestId, priority);
  }
}


