import { NursePerformanceRepository } from '../../../identity/nurse/repositories/nurse-performance.repository';

export class GetNurseBadgesUseCase {
  constructor(private readonly nursePerformanceRepository = NursePerformanceRepository) {}

  async execute(input: { nurseId: string }) {
    // TODO (Future Refactor): Move nurse badges into Identity/Nurse domain.
    return this.nursePerformanceRepository.findBadgesByNurseId(input.nurseId);
  }
}
