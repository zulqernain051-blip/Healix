import { AppError } from '../../../common/errors/AppError';
import { AuthRepository } from './auth.repository';
import { OtpChannel } from '@prisma/client';
import { logger } from '../../../common/utils/logger';

export class MfaService {
  static async enableMfa(userId: string) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (user.mfaEnabled) throw new AppError('MFA is already enabled', 400);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await AuthRepository.createOtpCode(user.id, code, OtpChannel.EMAIL, expiresAt);
    logger.info(`[MOCK SMS/EMAIL] Sent MFA enable code to ${user.email}: ${code}`);

    return { success: true, message: 'Verification code sent' };
  }

  static async verifyEnableMfa(userId: string, code: string) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);

    const activeOtp = await AuthRepository.findActiveOtp(userId, code);
    if (!activeOtp) throw new AppError('Invalid or expired MFA code', 400);

    await AuthRepository.consumeOtp(activeOtp.id);
    await AuthRepository.updateMfa(userId, true);

    return { success: true, message: 'MFA enabled successfully' };
  }

  static async disableMfa(userId: string, code: string) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (!user.mfaEnabled) throw new AppError('MFA is not enabled', 400);

    const activeOtp = await AuthRepository.findActiveOtp(userId, code);
    if (!activeOtp) throw new AppError('Invalid or expired MFA code', 400);

    await AuthRepository.consumeOtp(activeOtp.id);
    await AuthRepository.updateMfa(userId, false);

    return { success: true, message: 'MFA disabled successfully' };
  }

  static async requestDisableMfa(userId: string) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (!user.mfaEnabled) throw new AppError('MFA is not enabled', 400);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await AuthRepository.createOtpCode(user.id, code, OtpChannel.EMAIL, expiresAt);
    logger.info(`[MOCK SMS/EMAIL] Sent MFA disable code to ${user.email}: ${code}`);

    return { success: true, message: 'Verification code sent' };
  }
}
