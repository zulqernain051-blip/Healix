import { prisma } from '../../../common/config/database';
import { RegisterPayload } from './auth.types';
import { Role, OtpChannel, UserStatus } from '@prisma/client';
import { hashOtp, OtpPurpose } from './otp';
import { AppError } from '../../../common/errors/AppError';

/**
 * Repository layer for database operations relating to Authentication.
 * Only talks to Prisma and encapsulates transaction control.
 */
export class AuthRepository {
  public static async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        patient: true,
        nurse: true,
        doctor: true,
        admin: true,
        paramedic: true
      }
    });
  }

  public static async findUserByPhone(phone: string) {
    return prisma.user.findUnique({
      where: { phone },
      include: {
        patient: true,
        nurse: true,
        doctor: true,
        admin: true,
        paramedic: true
      }
    });
  }

  public static async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        patient: true,
        nurse: true,
        doctor: true,
        admin: true,
        paramedic: true
      }
    });
  }

  public static async findUserByEmailOrPhone(emailOrPhone: string) {
    return prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhone },
          { phone: emailOrPhone }
        ]
      },
      include: {
        patient: true,
        nurse: true,
        doctor: true,
        admin: true,
        paramedic: true
      }
    });
  }

  /**
   * Registers a user and creates their role-specific details in a single database transaction.
   */
  public static async createUser(payload: RegisterPayload, passwordHash: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Create base user
      const user = await tx.user.create({
        data: {
          email: payload.email.toLowerCase(),
          phone: payload.phone,
          fullName: payload.fullName,
          passwordHash,
          emailVerificationRequired: true,
          role: payload.role,
          status: UserStatus.PENDING_VERIFICATION // Defaults to pending
        }
      });

      // 2. Create corresponding role-specific tables
      if (payload.role === Role.PATIENT) {
        await tx.patient.create({
          data: {
            userId: user.id,
            cnic: payload.cnic!
          }
        });
      } else if (payload.role === Role.NURSE) {
        await tx.nurse.create({
          data: {
            userId: user.id,
            cnic: payload.cnic!,
            pncNumber: payload.pncNumber!
          }
        });
      } else if (payload.role === Role.DOCTOR) {
        await tx.doctor.create({
          data: {
            userId: user.id,
            cnic: payload.cnic!,
            pmdcNumber: payload.pmdcNumber!
          }
        });
      } else if (payload.role === Role.ADMIN) {
        await tx.administrator.create({
          data: {
            userId: user.id
          }
        });
      } else if (payload.role === Role.PARAMEDIC) {
        await tx.paramedic.create({ data: { userId: user.id, cnic: payload.cnic!, certificationNumber: payload.certificationNumber! } });
      }

      return user;
    });
  }

  public static async createOtpCode(userId: string, code: string, channel: OtpChannel, expiresAt: Date, purpose: OtpPurpose = 'VERIFICATION') {
    if (await this.countRecentOtps(userId, new Date(Date.now() - 60 * 60 * 1000)) >= 5) {
      throw new AppError('Too many OTP requests. Please try again in an hour.', 429);
    }
    return prisma.otpCode.create({
      data: {
        userId,
        code: hashOtp(userId, code, purpose),
        channel,
        expiresAt
      }
    });
  }

  public static async findActiveOtp(userId: string, code: string, purpose: OtpPurpose = 'VERIFICATION') {
    return prisma.otpCode.findFirst({
      where: {
        userId,
        code: hashOtp(userId, code, purpose),
        consumed: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });
  }

  public static async countRecentOtps(userId: string, since: Date) {
    return prisma.otpCode.count({
      where: {
        userId,
        createdAt: {
          gt: since
        }
      }
    });
  }

  public static async consumeOtp(otpId: string) {
    const result = await prisma.otpCode.updateMany({
      where: { id: otpId, consumed: false, expiresAt: { gt: new Date() } },
      data: { consumed: true }
    });
    if (result.count === 0) throw new AppError('Invalid or expired OTP code', 400);
    return result;
  }

  public static async updateUserStatus(userId: string, status: UserStatus) {
    return prisma.user.update({
      where: { id: userId },
      data: { status }
    });
  }

  public static async createSession(
    userId: string,
    refreshTokenHash: string,
    deviceInfo?: string,
    ipAddress?: string,
    expiresAt?: Date
  ) {
    return prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        deviceInfo,
        ipAddress,
        expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
      }
    });
  }

  public static async findSessionByTokenHash(refreshTokenHash: string) {
    return prisma.session.findUnique({
      where: { refreshTokenHash },
      include: {
        user: true
      }
    });
  }

  public static async revokeSession(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { revoked: true }
    });
  }

  public static async findActiveSession(sessionId: string, userId: string) {
    return prisma.session.findFirst({ where: { id: sessionId, userId, revoked: false, expiresAt: { gt: new Date() } } });
  }

  public static async rotateSession(sessionId: string, userId: string, refreshTokenHash: string, deviceInfo?: string, ipAddress?: string) {
    return prisma.$transaction(async tx => {
      const claimed = await tx.session.updateMany({
        where: { id: sessionId, userId, revoked: false, expiresAt: { gt: new Date() }, user: { deletedAt: null, OR: [{ status: UserStatus.ACTIVE }, { role: 'NURSE', status: UserStatus.PENDING_VERIFICATION }] } },
        data: { revoked: true }
      });
      if (claimed.count === 0) throw new AppError('Invalid or expired refresh token', 401);
      return tx.session.create({ data: { userId, refreshTokenHash, deviceInfo, ipAddress, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
    });
  }

  public static async revokeAllUserSessionsExcept(userId: string, activeSessionId?: string) {
    return prisma.session.updateMany({
      where: {
        userId,
        id: activeSessionId ? { not: activeSessionId } : undefined,
        revoked: false
      },
      data: { revoked: true }
    });
  }

  public static async updatePasswordAndRevokeSessions(userId: string, passwordHash: string) {
    return prisma.$transaction(async tx => {
      const user = await tx.user.update({ where: { id: userId }, data: { passwordHash } });
      await tx.session.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
      return user;
    });
  }

  public static async updateMfa(userId: string, enabled: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: enabled }
    });
  }

  public static async resetPasswordTransaction(userId: string, passwordHash: string, otpId: string) {
    return prisma.$transaction(async (tx) => {
      const consumed = await tx.otpCode.updateMany({
        where: { id: otpId, userId, consumed: false, expiresAt: { gt: new Date() } },
        data: { consumed: true }
      });
      if (consumed.count === 0) throw new AppError('Invalid or expired password reset verification code', 400);
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash }
      });

      await tx.session.updateMany({
        where: { userId },
        data: { revoked: true }
      });
    });
  }
}
