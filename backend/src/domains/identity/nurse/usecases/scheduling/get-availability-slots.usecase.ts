import { NurseRepository } from '../../nurse.repository';
import { NurseSchedulingRepository } from '../../repositories/nurse-scheduling.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class GetAvailabilitySlotsUseCase {
  public static async execute(nurseId: string) {
    const nurse = await NurseRepository.findNurseById(nurseId);
    if (!nurse) {
      throw new AppError('Nurse profile not found', HTTP_STATUS.NOT_FOUND);
    }
    return NurseSchedulingRepository.findAvailabilitySlots(nurseId);
  }
}
