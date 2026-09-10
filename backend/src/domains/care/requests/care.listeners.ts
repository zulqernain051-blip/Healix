import { AppEventBus, EVENTS } from '../../../common/events/app-event-bus';
import { CareRepository } from './care.repository';

export function registerCareListeners() {
  AppEventBus.on(EVENTS.VISIT_CANCELLED, async (payload: { visitId: string, careRequestId?: string, deleteSeries?: boolean }) => {
    try {
      if (!payload.deleteSeries || !payload.careRequestId) return;
      const currentRequest = await CareRepository.findRequestById(payload.careRequestId);

      if (currentRequest && currentRequest.notes && currentRequest.notes.includes('Recurring Visit')) {
        const match = currentRequest.notes.match(/pattern ([\w-]+)/);
        if (match) {
          const patternId = match[1];
          const futureRequests = await CareRepository.findFutureRequestsForPattern(patternId, currentRequest.patientId, payload.careRequestId);

          for (const req of futureRequests) {
            // Cancel future requests, emitting CARE_REQUEST_CANCELLED, which cancels visits, contracts, marketplace listing
            await CareRepository.updateCareRequestStatus(req.id, 'CANCELLED');
          }
          
          if (futureRequests.length > 0) {
            console.log(`[Care Domain] Cancelled ${futureRequests.length} future CareRequests for recurring pattern ${patternId}.`);
          }
        }
      }
    } catch (err: any) {
      console.error(`[Care Domain] Failed to process VISIT_CANCELLED:`, err.message);
    }
  });
}
