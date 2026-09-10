import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { mapPrismaError } from '../errors/prismaMapper';

/**
 * Wrapper utility to execute actions within a Prisma transaction block.
 * Automatically intercepts Prisma exceptions and applies mapPrismaError.
 */
export const withTransaction = async <T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> => {
  try {
    return await prisma.$transaction(callback);
  } catch (error) {
    throw mapPrismaError(error);
  }
};
