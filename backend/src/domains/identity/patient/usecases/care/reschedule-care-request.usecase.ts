import { CareRepository } from '../../../../care/requests/care.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class RescheduleCareRequestUseCase {
  constructor(
    private readonly careRepository = CareRepository
  ) {}

  async execute(requestId: string, patientId: string, scheduledAt: Date) {
    const request = await this.careRepository.findPatientCareRequestById(requestId);
    if (!request) throw new AppError('Care request not found', HTTP_STATUS.NOT_FOUND);
    if (request.patientId !== patientId) {
      throw new AppError('Access forbidden. You do not own this request.', HTTP_STATUS.FORBIDDEN);
    }

    const timeDiffMs = new Date(request.scheduledAt || new Date()).getTime() - Date.now();
    const twoHoursMs = 2 * 60 * 60 * 1000;
    if (timeDiffMs < twoHoursMs) {
      throw new AppError(
        'Rescheduling is only permitted up to 2 hours before the scheduled appointment.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return this.careRepository.rescheduleCareRequest(requestId, scheduledAt);
  }
}
