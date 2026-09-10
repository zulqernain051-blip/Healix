import { NurseSchedulingRepository } from '../../../identity/nurse/repositories/nurse-scheduling.repository';

export class DeleteVacationUseCase {
  constructor(private readonly nurseSchedulingRepository = NurseSchedulingRepository) {}

  async execute(input: { vacationId: string; nurseId: string }) {
    // TODO (Future Refactor): Move scheduling into Identity/Nurse domain after API versioning.
    return this.nurseSchedulingRepository.deleteVacation(input.vacationId, input.nurseId);
  }
}
