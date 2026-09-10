import { NurseRepository } from '../../nurse.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class GetNurseProfileByUserIdUseCase {
  public static async execute(userId: string) {
    const nurse = await NurseRepository.findNurseByUserId(userId);
    if (!nurse) {
      throw new AppError('Nurse profile not found', HTTP_STATUS.NOT_FOUND);
    }
    return nurse;
  }
}
