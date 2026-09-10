import { NursePerformanceRepository } from '../../../identity/nurse/repositories/nurse-performance.repository';

export class GetNurseScoreUseCase {
  constructor(private readonly nursePerformanceRepository = NursePerformanceRepository) {}

  async execute(input: { nurseId: string }) {
    // TODO (Future Refactor): Move nurse scoring into Identity/Nurse domain.
    let score = await this.nursePerformanceRepository.getNurseScore(input.nurseId);
    if (!score) {
      score = await this.nursePerformanceRepository.computeAndUpsertNurseScore(input.nurseId);
    }
    return score;
  }
}
