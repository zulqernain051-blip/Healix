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
export const protect = asyncHandler(async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
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
    const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string; role: string; fullName: string };

    // 3. Verify that the user still exists in the database
    const user = await AuthRepository.findUserById(decoded.id);
    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    // 4. Verify account is not suspended
    if (user.status === 'SUSPENDED') {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }

    // 5. Grant access by storing user details in Express request
    req.user = user;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Your session has expired. Please log in again.', 401);
    }
    throw new AppError('Invalid token. Please log in again.', 401);
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
