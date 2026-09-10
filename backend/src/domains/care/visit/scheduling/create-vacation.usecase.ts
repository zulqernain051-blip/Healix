import { NurseSchedulingRepository } from '../../../identity/nurse/repositories/nurse-scheduling.repository';

export class CreateVacationUseCase {
  constructor(private readonly nurseSchedulingRepository = NurseSchedulingRepository) {}

  async execute(input: { nurseId: string; startDate: Date; endDate: Date; reason?: string }) {
    // TODO (Future Refactor): Move scheduling into Identity/Nurse domain after API versioning.
    return this.nurseSchedulingRepository.createVacation(input.nurseId, input.startDate, input.endDate, input.reason);
  }
}
