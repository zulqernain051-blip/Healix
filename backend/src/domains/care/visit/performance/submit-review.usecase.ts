import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';
import { VisitRepository } from '../visit.repository';
import { NursePerformanceRepository } from '../../../identity/nurse/repositories/nurse-performance.repository';

export class SubmitReviewUseCase {
  constructor(
    private readonly visitRepository = VisitRepository,
    private readonly nursePerformanceRepository = NursePerformanceRepository
  ) {}

  async execute(input: { visitId: string; patientId: string; stars: number; reviewText?: string; recommend: boolean }) {
    const visit = await this.visitRepository.findVisitById(input.visitId);
    if (!visit) {
      throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
    }
    if (visit.status !== 'COMPLETED') {
      throw new AppError('Can only review completed visits', HTTP_STATUS.BAD_REQUEST);
    }
    if (visit.request.patientId !== input.patientId) {
      throw new AppError('Unauthorized: Only the assigned patient can review this visit', HTTP_STATUS.FORBIDDEN);
    }

    const existingReview = await this.nursePerformanceRepository.findReviewByVisitId(input.visitId);
    if (existingReview) {
      throw new AppError('This visit has already been reviewed', HTTP_STATUS.BAD_REQUEST);
    }

    if (!visit.nurseId) {
      throw new AppError('No nurse assigned to this visit to review', HTTP_STATUS.FORBIDDEN);
    }

    const review = await this.nursePerformanceRepository.createReview(
      input.visitId, 
      visit.nurseId, 
      input.patientId, 
      input.stars, 
      input.reviewText, 
      input.recommend
    );

    // TODO (Future Refactor): Move nurse scoring into Identity/Nurse domain.
    await this.nursePerformanceRepository.computeAndUpsertNurseScore(visit.nurseId);
    await this.nursePerformanceRepository.awardBadgesIfEligible(visit.nurseId);

    return review;
  }
}
