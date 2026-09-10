import { DoctorRepository } from '../../doctor.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';

export class RequestSecondOpinionUseCase {
  constructor(private readonly doctorRepository = DoctorRepository) {}

  async execute(caseId: string, requestingDoctorId: string, consultedDoctorId: string) {
    if (requestingDoctorId === consultedDoctorId) {
      throw new AppError('Cannot request a second opinion from yourself', HTTP_STATUS.BAD_REQUEST);
    }
    return this.doctorRepository.createSecondOpinion(caseId, requestingDoctorId, consultedDoctorId);
  }
}
