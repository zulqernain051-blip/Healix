import { NurseRepository } from '../../nurse.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class DeleteQualificationUseCase {
  public static async execute(nurseId: string, qualId: string) {
    const nurse = await NurseRepository.findNurseById(nurseId);
    if (!nurse) {
      throw new AppError('Nurse profile not found', HTTP_STATUS.NOT_FOUND);
    }
    const result = await NurseRepository.deleteQualification(qualId, nurseId);
    if (result.count === 0) {
      throw new AppError('Qualification not found', HTTP_STATUS.NOT_FOUND);
    }
    return { deleted: true };
  }
}
