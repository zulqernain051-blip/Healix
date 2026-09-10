import { AppError } from '../../../common/errors/AppError';
import { AuthRepository } from './auth.repository';
import { config } from '../../../common/config';
import { logger } from '../../../common/utils/logger';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class MfaLoginService {
  private static hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private static generateAccessToken(user: any): string {
    return jwt.sign(
      { id: user.id, role: user.role, fullName: user.fullName },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN as any }
    );
  }

  private static generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  private static mfaAttempts = new Map<string, number>();

  static async verifyMfaLogin(emailOrPhone: string, code: string, deviceInfo: string, ipAddress: string) {
    emailOrPhone = emailOrPhone.toLowerCase();
    const user = await AuthRepository.findUserByEmailOrPhone(emailOrPhone);
    if (!user) throw new AppError('User not found', 404);

    if (!user.mfaEnabled) throw new AppError('MFA is not enabled for this user', 400);

    const attempts = this.mfaAttempts.get(user.id) || 0;
    if (attempts >= 5) {
      throw new AppError('Too many failed attempts. Please request a new code.', 429);
    }

    const activeOtp = await AuthRepository.findActiveOtp(user.id, code);
    if (!activeOtp) {
      this.mfaAttempts.set(user.id, attempts + 1);
      throw new AppError('Invalid or expired MFA code', 400);
    }

    this.mfaAttempts.delete(user.id);
    await AuthRepository.consumeOtp(activeOtp.id);

    const accessToken = this.generateAccessToken(user);
    const rawRefreshToken = this.generateRefreshToken();
    const refreshTokenHash = this.hashRefreshToken(rawRefreshToken);

    await AuthRepository.createSession(
      user.id,
      refreshTokenHash,
      deviceInfo,
      ipAddress
    );

    return {
      tokens: { accessToken, refreshToken: rawRefreshToken },
      user: {
        id: user.id, email: user.email, phone: user.phone, fullName: user.fullName,
        role: user.role, status: user.status, createdAt: user.createdAt,
        patientId: user.patient?.id, nurseId: user.nurse?.id, doctorId: user.doctor?.id,
        paramedicId: (user as any).paramedic?.id
      }
    };
  }
}
