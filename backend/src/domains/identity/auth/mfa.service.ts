import { AppError } from '../../../common/errors/AppError';
import { AuthRepository } from './auth.repository';
import { OtpChannel } from '@prisma/client';
import { generateOtp, OtpAttempts } from './otp';
import { OtpDelivery } from './otp-delivery';

export class MfaService {
  static async enableMfa(userId: string) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (user.mfaEnabled) throw new AppError('MFA is already enabled', 400);

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await AuthRepository.createOtpCode(user.id, code, OtpChannel.EMAIL, expiresAt, 'MFA_ENABLE');
    OtpAttempts.reset(userId, 'MFA_ENABLE');
    await OtpDelivery.send(user.email, code, 'MFA_ENABLE');

    return { success: true, message: 'Verification code sent' };
  }

  static async verifyEnableMfa(userId: string, code: string) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);

    OtpAttempts.check(userId, 'MFA_ENABLE');
    const activeOtp = await AuthRepository.findActiveOtp(userId, code, 'MFA_ENABLE');
    if (!activeOtp) {
      OtpAttempts.fail(userId, 'MFA_ENABLE');
      throw new AppError('Invalid or expired MFA code', 400);
    }

    await AuthRepository.consumeOtp(activeOtp.id);
    OtpAttempts.reset(userId, 'MFA_ENABLE');
    await AuthRepository.updateMfa(userId, true);

    return { success: true, message: 'MFA enabled successfully' };
  }

  static async disableMfa(userId: string, code: string) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (!user.mfaEnabled) throw new AppError('MFA is not enabled', 400);

    OtpAttempts.check(userId, 'MFA_DISABLE');
    const activeOtp = await AuthRepository.findActiveOtp(userId, code, 'MFA_DISABLE');
    if (!activeOtp) {
      OtpAttempts.fail(userId, 'MFA_DISABLE');
      throw new AppError('Invalid or expired MFA code', 400);
    }

    await AuthRepository.consumeOtp(activeOtp.id);
    OtpAttempts.reset(userId, 'MFA_DISABLE');
    await AuthRepository.updateMfa(userId, false);

    return { success: true, message: 'MFA disabled successfully' };
  }

  static async requestDisableMfa(userId: string) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (!user.mfaEnabled) throw new AppError('MFA is not enabled', 400);

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await AuthRepository.createOtpCode(user.id, code, OtpChannel.EMAIL, expiresAt, 'MFA_DISABLE');
    OtpAttempts.reset(userId, 'MFA_DISABLE');
    await OtpDelivery.send(user.email, code, 'MFA_DISABLE');

    return { success: true, message: 'Verification code sent' };
  }
}
