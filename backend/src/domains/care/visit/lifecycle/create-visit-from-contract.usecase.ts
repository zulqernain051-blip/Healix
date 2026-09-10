import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';
import { ContractRepository } from '../../../marketplace/contracts/contract.repository';
import { VisitRepository } from '../visit.repository';

export class CreateVisitFromContractUseCase {
  async execute(contractId: string) {
    const contract = await ContractRepository.findContractById(contractId);

    if (!contract) {
      throw new AppError(`Contract ${contractId} not found.`, HTTP_STATUS.NOT_FOUND);
    }

    if (contract.status !== 'ACTIVE') {
      throw new AppError(`Cannot create visit. Contract status is ${contract.status}`, HTTP_STATUS.BAD_REQUEST);
    }

    if (!contract.careRequestId) {
      throw new AppError(`Cannot create visit. Contract ${contractId} is missing careRequestId`, HTTP_STATUS.BAD_REQUEST);
    }

    if (!contract.sourceOffer) {
      throw new AppError(`Cannot create visit. Contract ${contractId} is missing sourceOffer`, HTTP_STATUS.BAD_REQUEST);
    }

    if (!contract.sourceOffer.proposedStart) {
      throw new AppError(`Cannot create visit. Contract ${contractId} sourceOffer is missing proposedStart`, HTTP_STATUS.BAD_REQUEST);
    }

    const agreedStartTime = contract.sourceOffer.proposedStart;

    // 1. Idempotency Check
    const existingVisit = await VisitRepository.findVisitByRequestId(contract.careRequestId);

    if (existingVisit) {
      console.log(`[Visit Domain] Idempotency: Visit ${existingVisit.id} already exists for contract ${contractId}.`);
      return existingVisit;
    }

    // 3. Create Visit within its domain
    return VisitRepository.createVisitFromContract({
      requestId: contract.careRequestId,
      nurseId: contract.nurseId,
      agreedStartTime
    });
  }
}
