import { NurseSchedulingRepository } from '../../../identity/nurse/repositories/nurse-scheduling.repository';
import { AppError } from '../../../../common/errors/AppError';

export class CreateVacationUseCase {
  constructor(private readonly nurseSchedulingRepository = NurseSchedulingRepository) {}

  async execute(input: { nurseId: string; startDate: Date; endDate: Date; reason?: string }) {
    if (!Number.isFinite(input.startDate.getTime()) || !Number.isFinite(input.endDate.getTime()) || input.endDate <= input.startDate) {
      throw new AppError('Vacation end date must be after a valid start date', 400);
    }
    return this.nurseSchedulingRepository.createVacation(input.nurseId, input.startDate, input.endDate, input.reason);
  }
}
