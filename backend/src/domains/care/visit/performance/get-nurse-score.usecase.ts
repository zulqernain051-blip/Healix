import { NursePerformanceRepository } from '../../../identity/nurse/repositories/nurse-performance.repository';

export class GetNurseScoreUseCase {
  constructor(private readonly nursePerformanceRepository = NursePerformanceRepository) {}

  async execute(input: { nurseId: string }) {
    await this.nursePerformanceRepository.computeAndUpsertNurseScore(input.nurseId);
    const score = await this.nursePerformanceRepository.getNurseScore(input.nurseId);
    return score;
  }
}
