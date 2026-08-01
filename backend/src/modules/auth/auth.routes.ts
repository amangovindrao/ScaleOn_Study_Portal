import { Router } from 'express';
import { validate } from '@/middleware/validate.middleware';
import { authenticate } from '@/middleware/auth.middleware';
import { authLimiter } from '@/middleware/rateLimit.middleware';
import * as AuthController from './auth.controller';
import * as Schemas from './auth.validation';

const router = Router();

router.post('/login/admin', authLimiter, validate(Schemas.adminLoginSchema), AuthController.adminLogin);
router.post('/login/admin/google', authLimiter, validate(Schemas.googleAuthSchema), AuthController.adminGoogleLogin);
router.post('/login/intern', authLimiter, validate(Schemas.internLoginSchema), AuthController.internLogin);
router.post('/logout', authenticate(), AuthController.logout);
router.post('/refresh', authLimiter, AuthController.refreshToken);
router.post('/forgot-password', authLimiter, validate(Schemas.forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validate(Schemas.resetPasswordSchema), AuthController.resetPassword);
router.post('/change-password', authenticate(), validate(Schemas.changePasswordSchema), AuthController.changePassword);
router.post('/first-login/complete', validate(Schemas.firstLoginSchema), AuthController.completeFirstLogin);
router.get('/me', authenticate(), AuthController.me);

export default router;
