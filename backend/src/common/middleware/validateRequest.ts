import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Reusable Express middleware to validate request body, query params, and route parameters against Zod schemas.
 * Replaces manual parsing inside controllers and forwards any validation errors to the global error handler.
 */
export const validateRequest = (schemas: ValidationSchemas) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
