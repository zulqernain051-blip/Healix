import { NurseSchedulingRepository } from '../../../identity/nurse/repositories/nurse-scheduling.repository';
import { AppError } from '../../../../common/errors/AppError';

export class DeleteVacationUseCase {
  constructor(private readonly nurseSchedulingRepository = NurseSchedulingRepository) {}

  async execute(input: { vacationId: string; nurseId: string }) {
    // TODO (Future Refactor): Move scheduling into Identity/Nurse domain after API versioning.
    const result = await this.nurseSchedulingRepository.deleteVacation(input.vacationId, input.nurseId);
    if (result.count === 0) throw new AppError('Vacation not found', 404);
    return result;
  }
}
