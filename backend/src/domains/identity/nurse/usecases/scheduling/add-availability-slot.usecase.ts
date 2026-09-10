import { NurseRepository } from '../../nurse.repository';
import { NurseSchedulingRepository } from '../../repositories/nurse-scheduling.repository';
import { SchedulingPolicy } from '../../policies/scheduling.policy';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class AddAvailabilitySlotUseCase {
  public static async execute(nurseId: string, data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) {
    const nurse = await NurseRepository.findNurseById(nurseId);
    if (!nurse) {
      throw new AppError('Nurse profile not found', HTTP_STATUS.NOT_FOUND);
    }
    const existingSlots = await NurseSchedulingRepository.findAvailabilitySlotsForDay(nurseId, data.dayOfWeek);
    
    const hasOverlap = SchedulingPolicy.hasOverlappingSlot(existingSlots, data.startTime, data.endTime);
    if (hasOverlap) {
      throw new AppError(
        'This time slot overlaps with an existing availability slot for that day.',
        HTTP_STATUS.CONFLICT
      );
    }
    return NurseSchedulingRepository.addAvailabilitySlot(nurseId, data);
  }
}
