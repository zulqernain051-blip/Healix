import { NurseRepository } from '../../nurse.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class AddSpecializationUseCase {
  public static async execute(nurseId: string, specialization: string) {
    const nurse = await NurseRepository.findNurseById(nurseId);
    if (!nurse) {
      throw new AppError('Nurse profile not found', HTTP_STATUS.NOT_FOUND);
    }
    const existing = nurse.specializations.find((s) => s.specialization === specialization);
    if (existing) {
      throw new AppError('This specialization is already registered on your profile', HTTP_STATUS.CONFLICT);
    }
    return NurseRepository.addSpecialization(nurseId, specialization);
  }
}
