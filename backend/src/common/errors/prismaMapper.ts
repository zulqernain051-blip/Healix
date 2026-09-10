import { Prisma } from '@prisma/client';
import { AppError } from './AppError';
import { HTTP_STATUS } from '../constants';

/**
 * Maps standard Prisma Client error codes to clean, consistent AppError instances.
 * Prevents raw database exceptions from being exposed to the client.
 */
export const mapPrismaError = (error: any): any => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const fields = error.meta?.target as string[] | undefined;
        const fieldName = fields ? fields.join(', ') : 'field';
        return new AppError(
          `A record with this ${fieldName} already exists.`,
          HTTP_STATUS.CONFLICT
        );
      }
      case 'P2025': {
        return new AppError(
          (error.meta?.cause as string) || 'The requested record was not found.',
          HTTP_STATUS.NOT_FOUND
        );
      }
      case 'P2003': {
        return new AppError(
          'Database reference constraint failed. Invalid reference identifier.',
          HTTP_STATUS.BAD_REQUEST
        );
      }
      case 'P2014': {
        return new AppError(
          'Invalid relation constraint. Violates required database relations.',
          HTTP_STATUS.BAD_REQUEST
        );
      }
      default:
        break;
    }
  }
  return error;
};
