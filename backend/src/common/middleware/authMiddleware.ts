import { assertFeaturePermission } from './feature-permissions';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError';
import { config } from '../config';
import { AuthRepository } from '../../domains/identity/auth/auth.repository';
import { asyncHandler } from './asyncHandler';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Authentication middleware that verifies the JWT access token in the Authorization header.
 * If valid, injects the user model into the request object.
 */
const authenticatedRequests = new WeakSet<Request>();

export const protect = asyncHandler(async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (authenticatedRequests.has(req)) return next();
  let token: string | undefined;

  // 1. Retrieve bearer token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Authentication required. Please log in.', 401);
  }

  try {
    // 2. Validate token signature and expiry
    const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string; role: string; fullName: string; sid?: string };

    // 3. Verify that the user still exists in the database
    const user = await AuthRepository.findUserById(decoded.id);
    if (!user || user.deletedAt) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    if (typeof decoded.sid !== 'string' || !await AuthRepository.findActiveSession(decoded.sid, user.id)) {
      throw new AppError('Your session has ended. Please log in again.', 401);
    }

    if (user.emailVerificationRequired && !user.emailVerifiedAt) throw new AppError('Verify your email before using Healix.', 403);
    // 4. Verify account is active
    if (user.status === 'SUSPENDED') {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }
    // Pending nurses can finish their own profile and submit verification documents only.
    const nursePath = user.nurse ? `/api/v1/nurses/${user.nurse.id}` : '';
    const onboardingPath = user.role === 'NURSE' && user.status === 'PENDING_VERIFICATION' && (
      req.originalUrl.split('?')[0] === '/api/v1/auth/me' || (nursePath && req.originalUrl.split('?')[0].startsWith(nursePath + '/') &&
      /^\/(profile|qualifications(?:\/[^/]+)?|specializations(?:\/[^/]+\/certificate)?|photo|verification(?:\/(upload|file))?|documents\/[^/]+)$/.test(req.originalUrl.split('?')[0].slice(nursePath.length)))
    );
    if (user.status !== 'ACTIVE' && !onboardingPath) {
      throw new AppError('Your account is pending verification.', 403);
    }

    // 5. Grant access by storing user details in Express request
    await assertFeaturePermission(req, user);
    req.user = user;
    authenticatedRequests.add(req);
    next();
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Your session has expired. Please log in again.', 401);
    }
    if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
      throw new AppError('Invalid token. Please log in again.', 401);
    }
    throw err;
  }
});

/**
 * Authorization middleware helper to restrict endpoints to specific roles.
 */
export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action.', 403);
    }
    next();
  };
};
