import { VisitRepository } from '../visit.repository';
import { VisitExpiryPolicy } from '../shared/policies/visit-expiry.policy';

export class GetNurseVisitsUseCase {
  constructor(private readonly visitRepository = VisitRepository) {}

  async execute(input: { nurseId: string }) {
    const visits = await this.visitRepository.findVisitsByNurseId(input.nurseId);
    
    const now = new Date();
    return visits.map(v => {
      const isExpired = v.status === 'SCHEDULED' && VisitExpiryPolicy.isExpired(v.request.createdAt, now);
      return {
        ...v,
        isExpired
      };
    });
  }
}
