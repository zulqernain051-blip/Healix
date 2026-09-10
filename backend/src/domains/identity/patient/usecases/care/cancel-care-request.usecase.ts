import { CareRepository } from '../../../../care/requests/care.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class CancelCareRequestUseCase {
  constructor(
    private readonly careRepository = CareRepository
  ) {}

  async execute(requestId: string, patientId: string) {
    const request = await this.careRepository.findPatientCareRequestById(requestId);
    if (!request) throw new AppError('Care request not found', HTTP_STATUS.NOT_FOUND);
    if (request.patientId !== patientId) {
      throw new AppError('Access forbidden. You do not own this request.', HTTP_STATUS.FORBIDDEN);
    }

    if (request.status === 'IN_PROGRESS' || request.status === 'COMPLETED') {
      throw new AppError(
        'A visit that is in progress or completed cannot be cancelled.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return this.careRepository.updateCareRequestStatus(requestId, 'CANCELLED');
  }
}
