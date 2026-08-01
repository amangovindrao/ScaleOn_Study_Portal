import { Router } from 'express';
import { authenticate, requireUserType } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/permission.middleware';
import * as ProfileController from './profile.controller';

const router = Router();

// Intern own profile
router.get('/me', authenticate(), requireUserType('INTERN'), ProfileController.getMyProfile);
router.patch('/me', authenticate(), requireUserType('INTERN'), ProfileController.updateMyProfile);

// Admin: view/edit any profile
router.get('/intern/:internId', authenticate(), requireUserType('ADMIN'), requirePermission('profile.view_any'), ProfileController.getProfileByInternId);
router.patch('/intern/:internId', authenticate(), requireUserType('ADMIN'), requirePermission('profile.edit_any'), ProfileController.updateProfileByInternId);

export default router;
