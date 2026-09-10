import { Router } from 'express';
import {
  registerController,
  verifyOtpController,
  resendOtpController,
  loginController,
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
  verifyOtpSchema, 
  resendOtpSchema, 
  loginSchema, 
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from './auth.validation';

const router = Router();

// Public Authentication endpoints (pre-validated using Zod request validation middleware)
router.post('/register', validateRequest({ body: registerSchema }), registerController);
router.post('/verify-otp', validateRequest({ body: verifyOtpSchema }), verifyOtpController);
router.post('/resend-otp', validateRequest({ body: resendOtpSchema }), resendOtpController);
router.post('/login', validateRequest({ body: loginSchema }), loginController);
router.post('/refresh', validateRequest({ body: refreshTokenSchema }), refreshController);
router.post('/logout', validateRequest({ body: refreshTokenSchema }), logoutController);
router.post('/forgot-password', validateRequest({ body: forgotPasswordSchema }), forgotPasswordController);
router.post('/reset-password', validateRequest({ body: resetPasswordSchema }), resetPasswordController);
router.post('/verify-mfa-login', verifyMfaLoginController);

// Protected endpoints
router.get('/me', protect as any, getMeController);
router.post('/change-password', protect as any, validateRequest({ body: changePasswordSchema }), changePasswordController);

router.post('/mfa/enable', protect as any, enableMfaController);
router.post('/mfa/verify-enable', protect as any, verifyEnableMfaController);
router.post('/mfa/request-disable', protect as any, requestDisableMfaController);
router.post('/mfa/disable', protect as any, disableMfaController);

export default router;
