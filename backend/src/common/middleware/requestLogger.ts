import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Custom Express request logging middleware.
 * Tracks response execution durations using high-resolution timers and logs them through Winston.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();
  const ip = req.ip || req.socket.remoteAddress;

  // Intercept when the response finishing pipeline finishes
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1000 + diff[1] * 0.000001).toFixed(2);
    
    const message = `${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${timeInMs}ms | IP: ${ip}`;
    
    // Log with appropriate severity level based on HTTP status code
    if (res.statusCode >= 500) {
      logger.error(message);
    } else if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.log('http', message);
    }
  });

  next();
};
