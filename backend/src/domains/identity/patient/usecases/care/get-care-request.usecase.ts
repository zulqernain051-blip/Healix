import { CareRepository } from '../../../../care/requests/care.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class GetCareRequestUseCase {
  constructor(
    private readonly careRepository = CareRepository
  ) {}

  async execute(requestId: string, patientId: string) {
    const request = await this.careRepository.findPatientCareRequestById(requestId);
    if (!request) throw new AppError('Care request not found', HTTP_STATUS.NOT_FOUND);
    if (request.patientId !== patientId) {
      throw new AppError('Access forbidden. You do not own this request.', HTTP_STATUS.FORBIDDEN);
    }
    return request;
  }
}
