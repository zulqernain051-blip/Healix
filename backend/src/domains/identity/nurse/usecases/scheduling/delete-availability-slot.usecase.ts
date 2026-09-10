import { NurseRepository } from '../../nurse.repository';
import { NurseSchedulingRepository } from '../../repositories/nurse-scheduling.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class DeleteAvailabilitySlotUseCase {
  public static async execute(nurseId: string, slotId: string) {
    const nurse = await NurseRepository.findNurseById(nurseId);
    if (!nurse) {
      throw new AppError('Nurse profile not found', HTTP_STATUS.NOT_FOUND);
    }
    const result = await NurseSchedulingRepository.deleteAvailabilitySlot(slotId, nurseId);
    if (result.count === 0) {
      throw new AppError('Availability slot not found', HTTP_STATUS.NOT_FOUND);
    }
    return { deleted: true };
  }
}
