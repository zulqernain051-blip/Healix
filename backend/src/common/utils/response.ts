import { Response } from 'express';

/**
 * Sends a consistent successful API response structure.
 */
export const sendSuccessResponse = (
  res: Response,
  message: string,
  data: any = null,
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Sends a consistent API error response structure.
 */
export const sendErrorResponse = (
  res: Response,
  message: string,
  errors: any = null,
  statusCode: number = 500
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};
