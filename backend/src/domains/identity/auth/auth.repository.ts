import { prisma } from '../../../common/config/database';
import { RegisterPayload } from './auth.types';
import { Role, OtpChannel, UserStatus } from '@prisma/client';

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
        admin: true
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
        admin: true
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
        admin: true
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
        admin: true
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
      }

      return user;
    });
  }

  public static async createOtpCode(userId: string, code: string, channel: OtpChannel, expiresAt: Date) {
    return prisma.otpCode.create({
      data: {
        userId,
        code,
        channel,
        expiresAt
      }
    });
  }

  public static async findActiveOtp(userId: string, code: string) {
    return prisma.otpCode.findFirst({
      where: {
        userId,
        code,
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
    return prisma.otpCode.update({
      where: { id: otpId },
      data: { consumed: true }
    });
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

  public static async createResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt
      }
    });
  }

  public static async findActiveResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });
  }

  public static async useResetToken(tokenId: string) {
    return prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { used: true }
    });
  }

  public static async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
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
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash }
      });

      await tx.otpCode.update({
        where: { id: otpId },
        data: { consumed: true }
      });

      await tx.session.updateMany({
        where: { userId },
        data: { revoked: true }
      });
    });
  }
}
