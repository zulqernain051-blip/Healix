import jwt from 'jsonwebtoken';
import { protect } from '../authMiddleware';
import { AuthRepository } from '../../../domains/identity/auth/auth.repository';

jest.mock('../../config', () => ({ config: { JWT_SECRET: 'middleware-test-secret' } }));
jest.mock('../../../domains/identity/auth/auth.repository', () => ({ AuthRepository: { findUserById: jest.fn(), findActiveSession: jest.fn() } }));

beforeEach(() => (AuthRepository.findActiveSession as jest.Mock).mockResolvedValue({ id: 'session-1' }));

function authenticate(status: string) {
  (AuthRepository.findUserById as jest.Mock).mockResolvedValue({ id: 'user-1', status });
  return new Promise(resolve => protect({ originalUrl: '/api/v1/auth/me', method: 'GET', headers: { authorization: `Bearer ${jwt.sign({ id: 'user-1', sid: 'session-1' }, 'middleware-test-secret')}` } } as any, {} as any, resolve as any));
}

test.each(['SUSPENDED', 'PENDING_VERIFICATION'])('%s tokens preserve the forbidden error', async status => {
  expect(await authenticate(status)).toMatchObject({ statusCode: 403 });
});

test('active users are accepted', async () => {
  expect(await authenticate('ACTIVE')).toBeUndefined();
});

test('revoked sessions reject otherwise valid access tokens', async () => {
  (AuthRepository.findActiveSession as jest.Mock).mockResolvedValue(null);
  expect(await authenticate('ACTIVE')).toMatchObject({ statusCode: 401 });
});

test('database failures are not mislabeled as invalid tokens', async () => {
  const failure = new Error('database unavailable');
  (AuthRepository.findUserById as jest.Mock).mockRejectedValue(failure);
  const result = await new Promise(resolve => protect({ originalUrl: '/api/v1/auth/me', method: 'GET', headers: { authorization: `Bearer ${jwt.sign({ id: 'user-1' }, 'middleware-test-secret')}` } } as any, {} as any, resolve as any));
  expect(result).toBe(failure);
});
