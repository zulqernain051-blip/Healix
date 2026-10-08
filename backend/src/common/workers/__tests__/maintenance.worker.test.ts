import { MaintenanceWorker } from '../maintenance.worker';
import { logger } from '../../utils/logger';

jest.mock('../../utils/logger', () => ({ logger: { error: jest.fn() } }));
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('one failed job does not stop other jobs or crash the worker', async () => {
  const nextJob = jest.fn().mockResolvedValue(undefined);
  const worker = new MaintenanceWorker([{ name: 'broken', run: async () => { throw new Error('temporary failure'); } }, { name: 'next', run: nextJob }], 100);
  worker.start();
  await jest.advanceTimersByTimeAsync(100);
  await worker.stop();
  expect(nextJob).toHaveBeenCalledTimes(1);
  expect(logger.error).toHaveBeenCalled();
  await jest.advanceTimersByTimeAsync(1000);
  expect(nextJob).toHaveBeenCalledTimes(1);
});

test('slow jobs do not overlap, and shutdown waits for the active job', async () => {
  let finish!: () => void;
  const run = jest.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  const worker = new MaintenanceWorker([{ name: 'slow', run }], 100);
  worker.start();
  await jest.advanceTimersByTimeAsync(500);
  expect(run).toHaveBeenCalledTimes(1);
  const stopped = jest.fn();
  const pending = worker.stop().then(stopped);
  expect(stopped).not.toHaveBeenCalled();
  finish();
  await pending;
  expect(stopped).toHaveBeenCalledTimes(1);
});
