import { OutboxRepository } from './outbox.repository';
import { AppEventBus } from './app-event-bus';

export class OutboxService {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly pollIntervalMs = 5000;
  private readonly batchSize = 10;
  private readonly maxAttempts = 5;
  private readonly staleTimeoutMinutes = 10;

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // We intentionally don't await the loop iteration here to avoid blocking the caller.
    // The setInterval guarantees we don't start a new batch until the timer pops, 
    // but we should also ensure we don't overlap if a batch takes longer than the interval.
    let isProcessingBatch = false;

    this.intervalId = setInterval(async () => {
      if (isProcessingBatch) return;
      isProcessingBatch = true;
      try {
        await this.processBatch();
      } catch (err) {
        console.error('[OutboxService] Critical error in worker loop:', err);
      } finally {
        isProcessingBatch = false;
      }
    }, this.pollIntervalMs);

    console.log('[OutboxService] Worker started.');
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('[OutboxService] Worker stopped.');
  }

  private async processBatch() {
    // 1. Claim events safely
    const events = await OutboxRepository.claimEvents(
      this.batchSize,
      this.maxAttempts,
      this.staleTimeoutMinutes
    );

    if (!events || events.length === 0) {
      return;
    }

    // 2. Process each claimed event independently
    for (const event of events) {
      try {
        // Dispatch via application event bus (awaiting listener completion)
        await AppEventBus.emitAsync(event.eventType, event.payload);
        
        // Mark PROCESSED on success
        await OutboxRepository.markProcessed(event.id);
      } catch (error: any) {
        const errorMsg = error.message || String(error);
        console.error(`[OutboxService] Failed to process event ${event.id}:`, errorMsg);
        
        const newAttempts = (event.attempts || 0) + 1;
        // Exponential backoff: 2^attempts * 10 seconds (10s, 20s, 40s, 80s, etc.)
        const backoffSeconds = Math.pow(2, newAttempts) * 10;
        const nextAvailableAt = new Date(Date.now() + backoffSeconds * 1000);

        await OutboxRepository.markFailed(
          event.id,
          errorMsg,
          newAttempts,
          nextAvailableAt,
          this.maxAttempts
        );
      }
    }
  }
}

// Export a singleton instance
export const outboxService = new OutboxService();
