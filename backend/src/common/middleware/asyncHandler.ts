import { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Wraps async Express middleware/controllers to catch errors and forward them to the next error middleware.
 * Eliminates repetitive try-catch blocks in controller files.
 */
export const asyncHandler = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
