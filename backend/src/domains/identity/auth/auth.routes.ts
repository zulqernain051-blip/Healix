import { Router } from 'express';
import {
  registerController,
  registerInvitedController,
  verifyOtpController,
  resendOtpController,
  loginController,
  googleLoginController,
  refreshController,
  logoutController,
  getMeController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController
} from './auth.controller';
import {
  enableMfaController,
  verifyEnableMfaController,
  requestDisableMfaController,
  disableMfaController,
  verifyMfaLoginController
} from './mfa.controller';
import { protect } from '../../../common/middleware/authMiddleware';
import { validateRequest } from '../../../common/middleware/validateRequest';
import { 
  registerSchema, 
  registerInvitedSchema,
  mfaCodeSchema,
  verifyOtpSchema, 
  resendOtpSchema, 
  loginSchema, 
  googleLoginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from './auth.validation';

const router = Router();

// Public Authentication endpoints (pre-validated using Zod request validation middleware)
router.post('/register', validateRequest({ body: registerSchema }), registerController);
router.post('/register-invited', validateRequest({ body: registerInvitedSchema }), registerInvitedController);
router.post('/verify-otp', validateRequest({ body: verifyOtpSchema }), verifyOtpController);
router.post('/resend-otp', validateRequest({ body: resendOtpSchema }), resendOtpController);
router.post('/login', validateRequest({ body: loginSchema }), loginController);
router.post('/google', validateRequest({ body: googleLoginSchema }), googleLoginController);
router.post('/refresh', validateRequest({ body: refreshTokenSchema }), refreshController);
router.post('/logout', validateRequest({ body: refreshTokenSchema }), logoutController);
router.post('/forgot-password', validateRequest({ body: forgotPasswordSchema }), forgotPasswordController);
router.post('/reset-password', validateRequest({ body: resetPasswordSchema }), resetPasswordController);
router.post('/verify-mfa-login', validateRequest({ body: verifyOtpSchema }), verifyMfaLoginController);

// Protected endpoints
router.get('/me', protect as any, getMeController);
router.post('/change-password', protect as any, validateRequest({ body: changePasswordSchema }), changePasswordController);

router.post('/mfa/enable', protect as any, enableMfaController);
router.post('/mfa/verify-enable', protect as any, validateRequest({ body: mfaCodeSchema }), verifyEnableMfaController);
router.post('/mfa/request-disable', protect as any, requestDisableMfaController);
router.post('/mfa/disable', protect as any, validateRequest({ body: mfaCodeSchema }), disableMfaController);

export default router;
