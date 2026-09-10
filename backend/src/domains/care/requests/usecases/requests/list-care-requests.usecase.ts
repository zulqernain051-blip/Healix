import { CareRepository } from '../../care.repository';

export class ListCareRequestsUseCase {
  constructor(private readonly careRepository = CareRepository) {}

  async execute() {
    return this.careRepository.findNormalizedRequests();
  }
}


