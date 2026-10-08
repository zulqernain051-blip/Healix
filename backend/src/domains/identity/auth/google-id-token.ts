import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../common/errors/AppError';

type GoogleKey = { kid: string; kty: string; n: string; e: string; alg?: string; use?: string };
let cachedKeys: GoogleKey[] = [];
let cacheUntil = 0;

export async function verifyGoogleIdToken(credential: string): Promise<{ email: string }> {
  const clientId = process.env.GOOGLE_WEB_CLIENT_ID?.trim();
  if (!clientId) throw new AppError('Google sign-in is not configured.', 503);

  const decoded = jwt.decode(credential, { complete: true });
  if (!decoded || typeof decoded === 'string' || decoded.header.alg !== 'RS256' || !decoded.header.kid) {
    throw new AppError('Invalid Google credential.', 401);
  }

  if (Date.now() >= cacheUntil) {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/certs', { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new AppError('Google sign-in is temporarily unavailable.', 503);
    const body = await response.json() as { keys?: GoogleKey[] };
    if (!Array.isArray(body.keys)) throw new AppError('Google sign-in is temporarily unavailable.', 503);
    cachedKeys = body.keys;
    const maxAge = Number(response.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1] || 300);
    cacheUntil = Date.now() + Math.min(Math.max(maxAge, 60), 3600) * 1000;
  }

  const jwk = cachedKeys.find(key => key.kid === decoded.header.kid && key.kty === 'RSA');
  if (!jwk) throw new AppError('Invalid Google credential.', 401);
  const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  let claims: jwt.JwtPayload;
  try {
    claims = jwt.verify(credential, publicKey, {
      algorithms: ['RS256'],
      audience: clientId,
      issuer: ['https://accounts.google.com', 'accounts.google.com']
    }) as jwt.JwtPayload;
  } catch {
    throw new AppError('Invalid or expired Google credential.', 401);
  }

  const email = typeof claims.email === 'string' ? claims.email.toLowerCase() : '';
  // Google is authoritative for Gmail and hosted Workspace addresses. Other
  // Google accounts can use a third-party email whose ownership later changes.
  if (!claims.sub || claims.email_verified !== true || !email || !(email.endsWith('@gmail.com') || claims.hd)) {
    throw new AppError('Use your verified Gmail or Google Workspace address for this account.', 403);
  }
  return { email };
}
