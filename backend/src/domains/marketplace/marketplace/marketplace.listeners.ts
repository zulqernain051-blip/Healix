import { AppEventBus, EVENTS } from '../../../common/events/app-event-bus';
import { PublishCareRequestToMarketplaceUseCase } from './usecases/publish-care-request-to-marketplace.usecase';
import { MarketplaceRepository } from './marketplace.repository';

export function registerMarketplaceListeners() {
  AppEventBus.on(EVENTS.CARE_REQUEST_CREATED, async (payload: { careRequestId: string }) => {
    try {
      const usecase = new PublishCareRequestToMarketplaceUseCase();
      await usecase.execute(payload.careRequestId);
      console.log(`[Marketplace] Successfully published care request ${payload.careRequestId} to marketplace.`);
    } catch (err: any) {
      console.error(`[Marketplace] Failed to publish care request ${payload.careRequestId}:`, err.message);
    }
  });

  AppEventBus.on(EVENTS.CARE_REQUEST_CANCELLED, async (payload: { careRequestId: string }) => {
    try {
      // Idempotent close of listing
      await MarketplaceRepository.closeListingForRequest(payload.careRequestId);

      // Reject any pending offers
      await MarketplaceRepository.rejectPendingOffersForRequest(payload.careRequestId);

      console.log(`[Marketplace] Processed CARE_REQUEST_CANCELLED for request ${payload.careRequestId}.`);
    } catch (err: any) {
      console.error(`[Marketplace] Failed to process CARE_REQUEST_CANCELLED:`, err.message);
    }
  });

  const handleContractRejectedOrExpired = async (payload: { contractId: string }) => {
    try {
      const { MarketplaceRepository } = require('./marketplace.repository');
      
      const careRequestId = await MarketplaceRepository.findContractRequestId(payload.contractId);

      if (careRequestId) {
        await MarketplaceRepository.reopenListing(careRequestId);
        console.log(`[Marketplace] Reopened listing for CareRequest ${careRequestId} due to Contract ${payload.contractId} rejection/expiration.`);
      }
    } catch (err: any) {
      console.error(`[Marketplace] Failed to process contract rejection/expiration:`, err.message);
    }
  };

  AppEventBus.on(EVENTS.CONTRACT_REJECTED, handleContractRejectedOrExpired);
  AppEventBus.on(EVENTS.CONTRACT_EXPIRED, handleContractRejectedOrExpired);
}
