import { VisitRepository } from '../visit.repository';
import { VisitAccessPolicy, VisitActor } from '../shared/policies/visit-access.policy';
import { AppError } from '../../../../common/errors/AppError';

export class GetVisitDetailUseCase {
  async execute(visitId: string, actor: VisitActor) {
    const visit = await VisitRepository.findVisitById(visitId);
    if (!visit) throw new AppError('Visit not found', 404);
    VisitAccessPolicy.assertCanRead(visit, actor);
    return visit;
  }
}
