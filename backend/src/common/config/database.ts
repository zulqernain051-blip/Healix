import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Singleton Prisma Client configuration.
 * Configured to pipe database logs through Winston logger in development mode.
 */
export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
  ],
});

// Pipe database query execution details to Winston logger for developer convenience
prisma.$on('query' as any, (e: any) => {
  logger.debug(`[Query] ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
});
