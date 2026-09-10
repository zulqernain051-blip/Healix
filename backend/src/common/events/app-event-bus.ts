import { EventEmitter } from 'events';

class EventBus extends EventEmitter {
  async emitAsync(event: string, payload: any): Promise<void> {
    const listeners = this.listeners(event);
    if (listeners.length === 0) {
      return;
    }
    // We await each listener sequentially for simplicity and predictable failure tracking
    for (const listener of listeners) {
      await listener(payload);
    }
  }
}

export const AppEventBus = new EventBus();

// Events
export const EVENTS = {
  CARE_REQUEST_CREATED: 'CARE_REQUEST_CREATED',
  CARE_REQUEST_CANCELLED: 'CARE_REQUEST_CANCELLED',
  OFFER_SELECTED: 'OFFER_SELECTED',
  OFFER_EXPIRED: 'OFFER_EXPIRED',
  CONTRACT_ACTIVATED: 'CONTRACT_ACTIVATED',
  CONTRACT_REJECTED: 'CONTRACT_REJECTED',
  CONTRACT_EXPIRED: 'CONTRACT_EXPIRED',
  CONTRACT_CANCELLED: 'CONTRACT_CANCELLED',
  VISIT_CANCELLED: 'VISIT_CANCELLED',
  VISIT_STARTED: 'VISIT_STARTED',
  VISIT_COMPLETED: 'VISIT_COMPLETED'
};
