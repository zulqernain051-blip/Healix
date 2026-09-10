import { VisitRepository } from '../../../visit/visit.repository';

export class CancelVisitUseCase {
  constructor(private readonly visitRepository = VisitRepository) {}

  async execute(visitId: string, deleteSeries: boolean = false) {
    return this.visitRepository.cancelVisitAndFutureOccurrences(visitId, deleteSeries);
  }
}


