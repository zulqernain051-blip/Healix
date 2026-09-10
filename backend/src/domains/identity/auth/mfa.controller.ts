import { Request, Response } from 'express';
import { asyncHandler } from '../../../common/middleware/asyncHandler';
import { MfaService } from './mfa.service';
import { MfaLoginService } from './mfa-login.service';
import { sendSuccessResponse } from '../../../common/utils/response';

export const enableMfaController = asyncHandler(async (req: Request, res: Response) => {
  const result = await MfaService.enableMfa((req as any).user.id);
  return sendSuccessResponse(res, result.message, null, 200);
});

export const verifyEnableMfaController = asyncHandler(async (req: Request, res: Response) => {
  const result = await MfaService.verifyEnableMfa((req as any).user.id, req.body.code);
  return sendSuccessResponse(res, result.message, null, 200);
});

export const requestDisableMfaController = asyncHandler(async (req: Request, res: Response) => {
  const result = await MfaService.requestDisableMfa((req as any).user.id);
  return sendSuccessResponse(res, result.message, null, 200);
});

export const disableMfaController = asyncHandler(async (req: Request, res: Response) => {
  const result = await MfaService.disableMfa((req as any).user.id, req.body.code);
  return sendSuccessResponse(res, result.message, null, 200);
});

export const verifyMfaLoginController = asyncHandler(async (req: Request, res: Response) => {
  const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
  const ipAddress = req.ip || req.socket.remoteAddress;
  const result = await MfaLoginService.verifyMfaLogin(req.body.emailOrPhone, req.body.code, deviceInfo, ipAddress as string);
  return sendSuccessResponse(res, 'MFA login successful', result, 200);
});
