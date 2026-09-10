import { AppEventBus, EVENTS } from '../../../common/events/app-event-bus';
import { CreateVisitFromContractUseCase } from './lifecycle/create-visit-from-contract.usecase';
import { VisitRepository } from './visit.repository';

export function registerVisitListeners() {
  AppEventBus.on(EVENTS.CONTRACT_ACTIVATED, async (payload: { contractId: string }) => {
    try {
      const usecase = new CreateVisitFromContractUseCase();
      await usecase.execute(payload.contractId);
      console.log(`[Visit Domain] Successfully created visit for contract ${payload.contractId}.`);
    } catch (err: any) {
      console.error(`[Visit Domain] Failed to create visit for contract ${payload.contractId}:`, err.message);
    }
  });

  const handleVisitCancellation = async (careRequestId: string) => {
    try {
      const visits = await VisitRepository.findVisitIdsForRequest(careRequestId, ['SCHEDULED', 'ACCEPTED']);

      for (const visit of visits) {
        await VisitRepository.cancelVisitAndFutureOccurrences(visit.id, false);
      }
      if (visits.length > 0) {
        console.log(`[Visit Domain] Cancelled ${visits.length} visit(s) for CareRequest ${careRequestId}.`);
      }
    } catch (err: any) {
      console.error(`[Visit Domain] Failed to cancel visits for CareRequest ${careRequestId}:`, err.message);
    }
  };

  AppEventBus.on(EVENTS.CARE_REQUEST_CANCELLED, async (payload: { careRequestId: string }) => {
    await handleVisitCancellation(payload.careRequestId);
  });

  AppEventBus.on(EVENTS.CONTRACT_CANCELLED, async (payload: { contractId: string }) => {
    try {
      const { ContractRepository } = require('../../marketplace/contracts/contract.repository');
      const contract = await ContractRepository.findContractById(payload.contractId);
      if (contract && contract.careRequestId) {
        await handleVisitCancellation(contract.careRequestId);
      }
    } catch (err: any) {
      console.error(`[Visit Domain] Failed to process CONTRACT_CANCELLED:`, err.message);
    }
  });
}
