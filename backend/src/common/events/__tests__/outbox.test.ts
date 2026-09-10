import { PrismaClient } from '@prisma/client';
import { OutboxRepository } from '../outbox.repository';
import { OutboxService } from '../outbox.service';
import { AppEventBus } from '../app-event-bus';
import { prisma as appPrisma } from '../../config/database';

const prisma = new PrismaClient();

describe('EventOutbox Infrastructure', () => {
  let outboxService: OutboxService;

  beforeAll(async () => {
    // Clear outbox table before tests
    await prisma.eventOutbox.deleteMany();
  });

  beforeEach(async () => {
    outboxService = new OutboxService();
    // Clean before each test
    await prisma.eventOutbox.deleteMany();
    // Remove all event listeners attached during previous tests
    AppEventBus.removeAllListeners();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await appPrisma.$disconnect();
  });

  afterEach(() => {
    outboxService.stop();
  });

  it('A. Event creation inside a transaction persists', async () => {
    await prisma.$transaction(async (tx) => {
      await OutboxRepository.createEvent(tx, {
        eventType: 'TEST_EVENT',
        aggregateType: 'TEST_AGGREGATE',
        aggregateId: '123',
        payload: { key: 'value' },
      });
    });

    const events = await prisma.eventOutbox.findMany();
    expect(events.length).toBe(1);
    expect(events[0].status).toBe('PENDING');
    expect(events[0].eventType).toBe('TEST_EVENT');
    expect(events[0].payload).toEqual({ key: 'value' });
  });

  it('B. Successful processing (PENDING -> PROCESSING -> PROCESSED)', async () => {
    await prisma.eventOutbox.create({
      data: {
        eventType: 'SUCCESS_EVENT',
        aggregateType: 'TEST',
        aggregateId: '1',
        payload: {},
        status: 'PENDING',
      },
    });

    const mockListener = jest.fn().mockResolvedValue(undefined);
    AppEventBus.on('SUCCESS_EVENT', mockListener);

    // Call processBatch manually for testing
    await (outboxService as any).processBatch();

    expect(mockListener).toHaveBeenCalledTimes(1);

    const event = await prisma.eventOutbox.findFirst();
    expect(event?.status).toBe('PROCESSED');
    expect(event?.processedAt).not.toBeNull();
  });

  it('C. Listener failure updates attempts, lastError, and availableAt', async () => {
    const eventRow = await prisma.eventOutbox.create({
      data: {
        eventType: 'FAIL_EVENT',
        aggregateType: 'TEST',
        aggregateId: '1',
        payload: {},
        status: 'PENDING',
      },
    });

    const mockListener = jest.fn().mockRejectedValue(new Error('Listener failed'));
    AppEventBus.on('FAIL_EVENT', mockListener);

    await (outboxService as any).processBatch();

    const event = await prisma.eventOutbox.findUnique({ where: { id: eventRow.id } });
    expect(event?.status).toBe('FAILED');
    expect(event?.attempts).toBe(1);
    expect(event?.lastError).toContain('Listener failed');
    expect(event?.availableAt.getTime()).toBeGreaterThan(Date.now()); // moved forward
  });

  it('D. Retry successfully processes previously failed event', async () => {
    const eventRow = await prisma.eventOutbox.create({
      data: {
        eventType: 'RETRY_EVENT',
        aggregateType: 'TEST',
        aggregateId: '1',
        payload: {},
        status: 'FAILED',
        attempts: 1,
        // Set availableAt to past so it gets picked up
        availableAt: new Date(Date.now() - 10000), 
      },
    });

    const mockListener = jest.fn().mockResolvedValue(undefined);
    AppEventBus.on('RETRY_EVENT', mockListener);

    await (outboxService as any).processBatch();

    expect(mockListener).toHaveBeenCalledTimes(1);
    const event = await prisma.eventOutbox.findUnique({ where: { id: eventRow.id } });
    expect(event?.status).toBe('PROCESSED');
  });

  it('E. Maximum attempts eventually results in permanent failure', async () => {
    const eventRow = await prisma.eventOutbox.create({
      data: {
        eventType: 'MAX_FAIL_EVENT',
        aggregateType: 'TEST',
        aggregateId: '1',
        payload: {},
        status: 'FAILED',
        attempts: 4, // 5 is max
        availableAt: new Date(Date.now() - 10000), 
      },
    });

    const mockListener = jest.fn().mockRejectedValue(new Error('Fails again'));
    AppEventBus.on('MAX_FAIL_EVENT', mockListener);

    await (outboxService as any).processBatch();

    const event = await prisma.eventOutbox.findUnique({ where: { id: eventRow.id } });
    expect(event?.status).toBe('FAILED');
    expect(event?.attempts).toBe(5);
    
    // Process again, it should NOT be picked up since attempts = maxAttempts
    await (outboxService as any).processBatch();
    expect(mockListener).toHaveBeenCalledTimes(1); // Not called a second time
  });

  it('F. Stale PROCESSING recovery', async () => {
    const eventRow = await prisma.eventOutbox.create({
      data: {
        eventType: 'STALE_EVENT',
        aggregateType: 'TEST',
        aggregateId: '1',
        payload: {},
        status: 'PROCESSING',
        // Very old processingStartedAt
        processingStartedAt: new Date(Date.now() - 30 * 60 * 1000), 
      },
    });

    const mockListener = jest.fn().mockResolvedValue(undefined);
    AppEventBus.on('STALE_EVENT', mockListener);

    await (outboxService as any).processBatch();

    const event = await prisma.eventOutbox.findUnique({ where: { id: eventRow.id } });
    expect(event?.status).toBe('PROCESSED');
    expect(mockListener).toHaveBeenCalledTimes(1);
  });

  it('G. Concurrent workers cannot claim the same event', async () => {
    await prisma.eventOutbox.create({
      data: {
        eventType: 'CONCURRENT_EVENT',
        aggregateType: 'TEST',
        aggregateId: '1',
        payload: {},
        status: 'PENDING',
      },
    });

    // We simulate concurrent workers by calling claimEvents simultaneously
    const promise1 = OutboxRepository.claimEvents(10, 5, 10);
    const promise2 = OutboxRepository.claimEvents(10, 5, 10);

    const [batch1, batch2] = await Promise.all([promise1, promise2]);
    
    // One batch should get the event, the other should get 0
    expect(batch1.length + batch2.length).toBe(1);
  });

  it('H. Worker isolation: one failure does not stop others', async () => {
    await prisma.eventOutbox.createMany({
      data: [
        { eventType: 'ISOLATION_FAIL', aggregateType: 'TEST', aggregateId: '1', payload: {} },
        { eventType: 'ISOLATION_SUCCESS', aggregateType: 'TEST', aggregateId: '2', payload: {} },
      ],
    });

    AppEventBus.on('ISOLATION_FAIL', async () => { throw new Error('Boom'); });
    AppEventBus.on('ISOLATION_SUCCESS', async () => { return; });

    await (outboxService as any).processBatch();

    const failEvent = await prisma.eventOutbox.findFirst({ where: { eventType: 'ISOLATION_FAIL' }});
    const successEvent = await prisma.eventOutbox.findFirst({ where: { eventType: 'ISOLATION_SUCCESS' }});

    expect(failEvent?.status).toBe('FAILED');
    expect(successEvent?.status).toBe('PROCESSED');
  });
});
