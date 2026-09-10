import { CareRepository } from '../../care.repository';

export class GetOverdueMilestonesUseCase {
  constructor(private readonly careRepository = CareRepository) {}

  async execute() {
    return this.careRepository.findOverdueMilestones();
  }
}


