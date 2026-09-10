import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export interface CreateEventInput {
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: any;
}

export class OutboxRepository {
  /**
   * Appends an event to the outbox. MUST be called with a Prisma Transaction Client (`tx`).
   */
  public static async createEvent(
    tx: Prisma.TransactionClient,
    input: CreateEventInput
  ) {
    return tx.eventOutbox.create({
      data: {
        eventType: input.eventType,
        aggregateType: input.aggregateType,
        aggregateId: input.aggregateId,
        payload: input.payload,
        status: 'PENDING',
      },
    });
  }

  /**
   * Atomically claims a batch of eligible events using row-level locking (SKIP LOCKED).
   */
  public static async claimEvents(
    batchSize: number,
    maxAttempts: number,
    staleTimeoutMinutes: number
  ) {
    // Single atomic UPDATE with a CTE using FOR UPDATE SKIP LOCKED
    // This ensures that multiple workers cannot claim the same event.
    const claimedEvents = await prisma.$queryRaw<any[]>`
      WITH claimed AS (
        SELECT id FROM "event_outbox"
        WHERE status = 'PENDING'
           OR (status = 'FAILED' AND attempts < ${maxAttempts} AND "availableAt" <= NOW())
           OR (status = 'PROCESSING' AND "processingStartedAt" <= NOW() - INTERVAL '${Prisma.raw(staleTimeoutMinutes.toString())} minutes')
        ORDER BY "createdAt" ASC
        LIMIT ${batchSize}
        FOR UPDATE SKIP LOCKED
      )
      UPDATE "event_outbox"
      SET status = 'PROCESSING',
          "processingStartedAt" = NOW()
      WHERE id IN (SELECT id FROM claimed)
      RETURNING *;
    `;

    return claimedEvents;
  }

  public static async markProcessed(eventId: string) {
    return prisma.eventOutbox.update({
      where: { id: eventId },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    });
  }

  public static async markFailed(
    eventId: string,
    errorMsg: string,
    newAttempts: number,
    nextAvailableAt: Date,
    maxAttempts: number
  ) {
    return prisma.eventOutbox.update({
      where: { id: eventId },
      data: {
        status: newAttempts >= maxAttempts ? 'FAILED' : 'FAILED', // We keep it FAILED, the query picks it up based on attempts
        lastError: errorMsg,
        attempts: newAttempts,
        availableAt: nextAvailableAt,
      },
    });
  }
}
