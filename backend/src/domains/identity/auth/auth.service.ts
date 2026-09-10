import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import { RegisterPayload, LoginPayload, TokenResponse, UserResponse } from './auth.types';
import { AppError } from '../../../common/errors/AppError';
import { config } from '../../../common/config';
import { logger } from '../../../common/utils/logger';
import { Role, OtpChannel, UserStatus } from '@prisma/client';

/**
 * Service layer containing core business rules for Authentication.
 * Coordinates repository operations and handles cryptographic functions.
 */
import { RegisterInvitedUseCase } from './usecases/register-invited.usecase';
export class AuthService {
  static async registerInvited(dto: any) {
    const { user } = await RegisterInvitedUseCase.execute(dto);
    const accessToken = this.generateAccessToken(user);
    const rawRefreshToken = this.generateRefreshToken();
    const bcrypt = require('bcrypt');
    const hashedRefresh = await bcrypt.hash(rawRefreshToken, 12);
    
    const { prisma } = require('../../../common/config/database');
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashedRefresh,
        deviceInfo: dto.deviceInfo || 'Unknown',
        ipAddress: '127.0.0.1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
      accessToken,
      refreshToken: rawRefreshToken
    };
  }
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

  /**
   * Registers a new user. Performs checks for unique fields, hashes password, 
   * initiates verification by generating a 6-digit OTP code, and saves details.
   */
  public static async register(payload: RegisterPayload) {
    // 1. Validate email uniqueness
    payload.email = payload.email.toLowerCase();
    const existingEmail = await AuthRepository.findUserByEmail(payload.email);
    if (existingEmail) {
      throw new AppError('Email is already registered', 409);
    }

    // 2. Validate phone uniqueness
    const existingPhone = await AuthRepository.findUserByPhone(payload.phone);
    if (existingPhone) {
      throw new AppError('Phone number is already registered', 409);
    }

    // 3. Hash raw password securely using bcrypt
    const passwordHash = await bcrypt.hash(payload.password, 12);

    // 4. Create base user and role-specific rows inside a transaction
    const user = await AuthRepository.createUser(payload, passwordHash);

    // 5. Generate a 6-digit verification OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    await AuthRepository.createOtpCode(user.id, code, OtpChannel.EMAIL, expiresAt);

    // MOCK delivery system (logs code to console so developers can easily run tests)
    logger.info(`📧 [MOCK SMS/EMAIL] Sent OTP verification code to user ${user.email}: CODE is ${code}`);

    return {
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    };
  }

  /**
   * Validates an OTP code and activates Patient status, or maintains Nurse/Doctor status pending admin review.
   */
  public static async verifyOtp(emailOrPhone: string, code: string) {
    emailOrPhone = emailOrPhone.toLowerCase();
    const user = await AuthRepository.findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const otp = await AuthRepository.findActiveOtp(user.id, code);
    if (!otp) {
      throw new AppError('Invalid or expired OTP code', 400);
    }

    // Mark OTP code consumed to prevent replay attacks
    await AuthRepository.consumeOtp(otp.id);

    let updatedStatus = user.status;
    if (user.role === Role.PATIENT) {
      // Patients are activated automatically after verifying their OTP
      updatedStatus = UserStatus.ACTIVE;
      await AuthRepository.updateUserStatus(user.id, updatedStatus);
      logger.info(`User ${user.email} (PATIENT) successfully verified OTP and activated.`);
    } else {
      // Nurses and Doctors remain PENDING_VERIFICATION for admin approval, even after verifying OTP
      logger.info(`User ${user.email} (${user.role}) verified OTP, waiting for Admin review.`);
    }

    return {
      userId: user.id,
      role: user.role,
      status: updatedStatus
    };
  }

  /**
   * Re-issues a new OTP code, subject to rate limits.
   */
  public static async resendOtp(emailOrPhone: string) {
    emailOrPhone = emailOrPhone.toLowerCase();
    const user = await AuthRepository.findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Enforce rate limit: max 5 OTP requests per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOtpsCount = await AuthRepository.countRecentOtps(user.id, oneHourAgo);

    if (recentOtpsCount >= 5) {
      throw new AppError('Too many OTP requests. Please try again in an hour.', 429);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await AuthRepository.createOtpCode(user.id, code, OtpChannel.EMAIL, expiresAt);
    logger.info(`📧 [MOCK SMS/EMAIL] Re-issued OTP verification code to user ${user.email}: CODE is ${code}`);

    return { success: true };
  }

  /**
   * Authenticates user, issues access and refresh tokens, and registers the session.
   */
  public static async login(payload: LoginPayload): Promise<any> {
    payload.emailOrPhone = payload.emailOrPhone.toLowerCase();
    const user = await AuthRepository.findUserByEmailOrPhone(payload.emailOrPhone);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password match
    const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Enforce status checks
    if (user.status === UserStatus.PENDING_VERIFICATION) {
      if (user.role === Role.PATIENT) {
        throw new AppError('Please verify your OTP code to activate your account.', 403);
      }
      throw new AppError('Your account is pending administrator verification.', 403);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }

    if (user.mfaEnabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await AuthRepository.createOtpCode(user.id, code, OtpChannel.EMAIL, expiresAt);
      logger.info(`[MOCK SMS/EMAIL] Sent MFA login code to ${user.email}: ${code}`);
      return { mfaRequired: true, message: 'MFA verification required' };
    }

    // Generate token set
    const accessToken = this.generateAccessToken(user);
    const rawRefreshToken = this.generateRefreshToken();
    const refreshTokenHash = this.hashRefreshToken(rawRefreshToken);

    // Save hashed session details for token validation
    await AuthRepository.createSession(
      user.id,
      refreshTokenHash,
      payload.deviceInfo,
      payload.ipAddress
    );

    return {
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken
      },
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        patientId: user.patient?.id,
        nurseId: user.nurse?.id,
        doctorId: user.doctor?.id
      }
    };
  }

  /**
   * Exchanges a valid refresh token for a new access token + refresh token set (Token Rotation).
   */
  public static async refresh(refreshToken: string, deviceInfo?: string, ipAddress?: string): Promise<TokenResponse> {
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    
    const session = await AuthRepository.findSessionByTokenHash(refreshTokenHash);
    if (!session || session.revoked || session.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Immediately revoke old session to prevent replay attacks
    await AuthRepository.revokeSession(session.id);

    // Generate new token pair
    const accessToken = this.generateAccessToken(session.user);
    const rawRefreshToken = this.generateRefreshToken();
    const newHash = this.hashRefreshToken(rawRefreshToken);

    // Save new rotating session
    await AuthRepository.createSession(
      session.userId,
      newHash,
      deviceInfo || session.deviceInfo || undefined,
      ipAddress || session.ipAddress || undefined
    );

    return {
      accessToken,
      refreshToken: rawRefreshToken
    };
  }

  /**
   * Revokes a session upon user logout.
   */
  public static async logout(refreshToken: string) {
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    const session = await AuthRepository.findSessionByTokenHash(refreshTokenHash);
    if (!session) {
      throw new AppError('Invalid token', 400);
    }

    await AuthRepository.revokeSession(session.id);
    return { success: true };
  }

  /**
   * Initiates password reset by sending a verification OTP code.
   */
  public static async forgotPassword(emailOrPhone: string) {
    emailOrPhone = emailOrPhone.toLowerCase();
    const user = await AuthRepository.findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      logger.info(`Password reset requested for unknown user: ${emailOrPhone}`);
      return { success: true, message: 'If an account exists, password reset instructions have been sent.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await AuthRepository.createOtpCode(user.id, code, OtpChannel.EMAIL, expiresAt);
    logger.info(`📧 [MOCK SMS/EMAIL] Sent OTP verification code to user ${user.email} for password reset: CODE is ${code}`);

    return { success: true };
  }

  private static resetAttempts = new Map<string, number>();

  /**
   * Resets password using valid verification OTP.
   */
  public static async resetPassword(emailOrPhone: string, code: string, newPassword: string) {
    emailOrPhone = emailOrPhone.toLowerCase();
    const user = await AuthRepository.findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const attempts = this.resetAttempts.get(user.id) || 0;
    if (attempts >= 5) {
      throw new AppError('Too many failed attempts. Please request a new OTP.', 429);
    }

    const activeOtp = await AuthRepository.findActiveOtp(user.id, code);
    if (!activeOtp) {
      this.resetAttempts.set(user.id, attempts + 1);
      throw new AppError('Invalid or expired password reset verification code', 400);
    }

    this.resetAttempts.delete(user.id);

    // Hash new password securely
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password inside transaction and invalidate user sessions
    await AuthRepository.resetPasswordTransaction(user.id, passwordHash, activeOtp.id);

    return { success: true };
  }

  /**
   * Changes password for authenticated active session.
   */
  public static async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Incorrect current password', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await AuthRepository.updatePassword(userId, passwordHash);

    return { success: true };
  }
}
