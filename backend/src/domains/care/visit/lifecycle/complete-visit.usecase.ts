import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';
import { VisitRepository } from '../visit.repository';
import { NursePerformanceRepository } from '../../../identity/nurse/repositories/nurse-performance.repository';

export class CompleteVisitUseCase {
  constructor(
    private readonly visitRepository = VisitRepository,
    private readonly nursePerformanceRepository = NursePerformanceRepository
  ) {}

  async execute(input: { visitId: string; nurseId: string }) {
    const visit = await this.visitRepository.findVisitById(input.visitId);
    if (!visit) {
      throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
    }
    if (visit.nurseId !== input.nurseId) {
      throw new AppError('Unauthorized', HTTP_STATUS.BAD_REQUEST);
    }
    if (visit.status !== 'IN_PROGRESS') {
      throw new AppError('Visit must be in progress to complete', HTTP_STATUS.BAD_REQUEST);
    }

    // Check vitals submitted
    if (visit.vitals.length === 0) {
      throw new AppError('Cannot complete visit: vitals have not been submitted.', HTTP_STATUS.BAD_REQUEST);
    }

    const completedVisit = await this.visitRepository.completeVisit(input.visitId);

    // Compute updated scores and badges
    await this.nursePerformanceRepository.computeAndUpsertNurseScore(input.nurseId);
    await this.nursePerformanceRepository.awardBadgesIfEligible(input.nurseId);

    // Future Domain Event: VisitCompleted
    return completedVisit;
  }
}
