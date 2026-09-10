import { Request, Response } from 'express';
import { asyncHandler } from '../../../common/middleware/asyncHandler';
import { sendSuccessResponse } from '../../../common/utils/response';
import { HTTP_STATUS } from '../../../common/constants';

/**
 * Controller to handle API health check request.
 */
export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccessResponse(
    res,
    'Healix API is running smoothly',
    {
      uptime: process.uptime(),
      timestamp: new Date()
    },
    HTTP_STATUS.OK
  );
});
