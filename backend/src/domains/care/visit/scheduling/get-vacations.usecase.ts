import { NurseSchedulingRepository } from '../../../identity/nurse/repositories/nurse-scheduling.repository';

export class GetVacationsUseCase {
  constructor(private readonly nurseSchedulingRepository = NurseSchedulingRepository) {}

  async execute(input: { nurseId: string }) {
    // TODO (Future Refactor): Move scheduling into Identity/Nurse domain after API versioning.
    return this.nurseSchedulingRepository.findVacationsByNurseId(input.nurseId);
  }
}
