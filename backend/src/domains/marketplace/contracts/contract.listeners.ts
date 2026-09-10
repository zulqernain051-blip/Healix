import { AppEventBus, EVENTS } from '../../../common/events/app-event-bus';
import { ContractRepository } from './contract.repository';
export function registerContractListeners() {
  AppEventBus.on(EVENTS.CARE_REQUEST_CANCELLED, async (payload: { careRequestId: string }) => {
    try {
      const contracts = await ContractRepository.findContractIdsForRequest(payload.careRequestId, ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE']);
      for (const contract of contracts) {
        await ContractRepository.cancelContract(contract.id, 'CareRequest was cancelled', 'SYSTEM', 'SYSTEM');
      }

      if (contracts.length > 0) {
        console.log(`[Contract Domain] Cancelled ${contracts.length} contract(s) due to CareRequest ${payload.careRequestId} cancellation.`);
      }
    } catch (err: any) {
      console.error(`[Contract Domain] Failed to cancel contracts for CareRequest ${payload.careRequestId}:`, err.message);
    }
  });

  AppEventBus.on(EVENTS.VISIT_CANCELLED, async (payload: { visitId: string, careRequestId?: string }) => {
    try {
      if (!payload.careRequestId) return;
      const contracts = await ContractRepository.findContractIdsForRequest(payload.careRequestId, ['PENDING_APPROVAL', 'ACTIVE']);
      for (const contract of contracts) {
        await ContractRepository.cancelContract(contract.id, 'Visit was cancelled', 'SYSTEM', 'SYSTEM');
      }

      if (contracts.length > 0) {
        console.log(`[Contract Domain] Cancelled ${contracts.length} contract(s) due to Visit ${payload.visitId} cancellation.`);
      }
    } catch (err: any) {
      console.error(`[Contract Domain] Failed to cancel contracts for Visit ${payload.visitId}:`, err.message);
    }
  });

  AppEventBus.on(EVENTS.OFFER_SELECTED, async (payload: { listingId: string, offerId: string }) => {
    try {
      const { CreateContractFromOfferUseCase } = require('./usecases/create-contract-from-offer.usecase');
      const usecase = new CreateContractFromOfferUseCase();
      await usecase.execute(payload.listingId, payload.offerId);
      console.log(`[Contract Domain] Processed OFFER_SELECTED for offer ${payload.offerId}.`);
    } catch (err: any) {
      if (err.code === 'P2002') {
        // Idempotent constraint trigger
        console.log(`[Contract Domain] Contract already exists for offer ${payload.offerId}. Treating as success.`);
      } else {
        console.error(`[Contract Domain] Failed to process OFFER_SELECTED:`, err.message);
      }
    }
  });
}
