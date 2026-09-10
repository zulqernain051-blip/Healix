import { NursePerformanceRepository } from '../../../identity/nurse/repositories/nurse-performance.repository';

export class GetNurseReviewsUseCase {
  constructor(private readonly nursePerformanceRepository = NursePerformanceRepository) {}

  async execute(input: { nurseId: string }) {
    // TODO (Future Refactor): Move nurse reviews into Identity/Nurse domain.
    return this.nursePerformanceRepository.findReviewsByNurseId(input.nurseId);
  }
}
