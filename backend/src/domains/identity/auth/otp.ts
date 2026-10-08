import crypto from 'crypto';
import { AppError } from '../../../common/errors/AppError';

export type OtpPurpose = 'VERIFICATION' | 'PASSWORD_RESET' | 'MFA_LOGIN' | 'MFA_ENABLE' | 'MFA_DISABLE';

export function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

// Purpose-bound hashes fit the existing string column and prevent one workflow's
// code from authorizing a different workflow. Previously issued raw codes expire.
export function hashOtp(userId: string, code: string, purpose: OtpPurpose): string {
  return crypto.createHash('sha256').update(`${userId}:${purpose}:${code}`).digest('hex');
}

export class OtpAttempts {
  private static attempts = new Map<string, { count: number; expiresAt: number }>();

  static check(userId: string, purpose: OtpPurpose) {
    const key = `${userId}:${purpose}`;
    const entry = this.attempts.get(key);
    if (entry && entry.expiresAt <= Date.now()) this.attempts.delete(key);
    else if (entry && entry.count >= 5) throw new AppError('Too many failed attempts. Please request a new code.', 429);
  }

  static fail(userId: string, purpose: OtpPurpose) {
    const key = `${userId}:${purpose}`;
    const current = this.attempts.get(key);
    const entry = current && current.expiresAt > Date.now() ? current : { count: 0, expiresAt: Date.now() + 10 * 60 * 1000 };
    entry.count++;
    this.attempts.set(key, entry);
  }

  static reset(userId: string, purpose: OtpPurpose) {
    this.attempts.delete(`${userId}:${purpose}`);
  }
}
