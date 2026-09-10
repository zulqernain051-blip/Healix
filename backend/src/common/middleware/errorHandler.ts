import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { mapPrismaError } from '../errors/prismaMapper';
import { logger } from '../utils/logger';
import { sendErrorResponse } from '../utils/response';
import { config } from '../config';
import { ZodError } from 'zod';

/**
 * Global Express error handling middleware.
 * Intercepts all thrown errors, formats them, and returns a unified JSON error response.
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Map Prisma database exceptions to AppErrors first
  const mappedErr = mapPrismaError(err);
  
  const statusCode = mappedErr.statusCode || 500;
  
  // Log error message and stack trace to Winston logger
  logger.error(`${mappedErr.message} \nStack: ${mappedErr.stack}`);

  // 1. Handle custom operational errors (AppError)
  if (mappedErr instanceof AppError) {
    return sendErrorResponse(res, mappedErr.message, mappedErr.errors, mappedErr.statusCode);
  }

  // 2. Handle Zod input validation errors
  if (mappedErr instanceof ZodError) {
    const formattedErrors = mappedErr.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return sendErrorResponse(res, 'Validation failed', formattedErrors, 400);
  }

  // 3. Fallback for unhandled developer or runtime errors
  const message = config.NODE_ENV === 'development' 
    ? mappedErr.message 
    : 'Something went wrong on the server.';
    
  return sendErrorResponse(res, message, null, statusCode);
};
