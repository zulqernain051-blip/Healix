import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';
import { VisitRepository } from '../visit.repository';

export class SaveNotesUseCase {
  constructor(private readonly visitRepository = VisitRepository) {}

  async execute(input: { visitId: string; nurseId: string; notes: string }) {
    const visit = await this.visitRepository.findVisitById(input.visitId);
    if (!visit) {
      throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
    }
    if (visit.nurseId !== input.nurseId) {
      throw new AppError('Unauthorized', HTTP_STATUS.BAD_REQUEST);
    }
    if (visit.status !== 'IN_PROGRESS' && visit.status !== 'COMPLETED') {
      throw new AppError('Notes can only be saved when a visit is IN_PROGRESS or COMPLETED', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Future Domain Event: VisitNotesSaved
    return this.visitRepository.saveVisitNotes(input.visitId, input.notes);
  }
}
