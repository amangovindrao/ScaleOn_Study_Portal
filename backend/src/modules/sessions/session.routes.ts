import { Router } from 'express';
import { authenticate, requireUserType } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/permission.middleware';
import * as SessionController from './session.controller';

const router = Router();

// Own sessions (both user types)
router.get('/me', authenticate(), SessionController.mySession);
router.get('/me/login-history', authenticate(), SessionController.myLoginHistory);

// Admin-only session management
router.get('/', authenticate(), requireUserType('ADMIN'), requirePermission('session.view'), SessionController.listSessions);
router.delete('/:id', authenticate(), requireUserType('ADMIN'), requirePermission('session.terminate'), SessionController.terminateSession);
router.delete('/user/:userId/all', authenticate(), requireUserType('ADMIN'), requirePermission('session.terminate'), SessionController.terminateUserSessions);
router.get('/user/:userId/login-history', authenticate(), requireUserType('ADMIN'), requirePermission('login_history.view'), SessionController.userLoginHistory);

export default router;
