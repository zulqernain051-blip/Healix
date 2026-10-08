import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { verifyGoogleIdToken } from '../google-id-token';

const keys = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...(keys.publicKey.export({ format: 'jwk' }) as object), kid: 'healix-test-key', use: 'sig', alg: 'RS256' };
const originalFetch = global.fetch;

beforeAll(() => {
  process.env.GOOGLE_WEB_CLIENT_ID = 'healix-test.apps.googleusercontent.com';
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    headers: { get: () => 'public, max-age=300' },
    json: async () => ({ keys: [jwk] })
  }) as typeof fetch;
});
afterAll(() => { global.fetch = originalFetch; delete process.env.GOOGLE_WEB_CLIENT_ID; });

function credential(overrides: Record<string, unknown> = {}, audience = 'healix-test.apps.googleusercontent.com') {
  return jwt.sign({ email: 'doctor@gmail.com', email_verified: true, ...overrides }, keys.privateKey, {
    algorithm: 'RS256', keyid: 'healix-test-key', issuer: 'https://accounts.google.com',
    audience, subject: 'google-user-1', expiresIn: '5m'
  });
}

test('accepts a signed Google token for the configured client and verified Gmail address', async () => {
  await expect(verifyGoogleIdToken(credential())).resolves.toEqual({ email: 'doctor@gmail.com' });
});
test('rejects a token for another OAuth client', async () => {
  await expect(verifyGoogleIdToken(credential({}, 'other-client'))).rejects.toMatchObject({ statusCode: 401 });
});
test('rejects a Google account with an unhosted third-party email', async () => {
  await expect(verifyGoogleIdToken(credential({ email: 'doctor@example.com' }))).rejects.toMatchObject({ statusCode: 403 });
});
test('rejects an unverified email', async () => {
  await expect(verifyGoogleIdToken(credential({ email_verified: false }))).rejects.toMatchObject({ statusCode: 403 });
});
