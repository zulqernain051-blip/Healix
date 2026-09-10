import { NurseRepository } from '../../nurse.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class AddQualificationUseCase {
  public static async execute(nurseId: string, data: {
    title: string;
    issuingBody: string;
    yearObtained: number;
  }) {
    const nurse = await NurseRepository.findNurseById(nurseId);
    if (!nurse) {
      throw new AppError('Nurse profile not found', HTTP_STATUS.NOT_FOUND);
    }
    return NurseRepository.addQualification(nurseId, data);
  }
}
