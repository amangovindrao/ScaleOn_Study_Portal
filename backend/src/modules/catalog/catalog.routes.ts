import { Router } from 'express';
import { authenticate, requireUserType } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/permission.middleware';
import * as RoleController from '@/modules/roles/role.controller';

const router = Router();

router.use(authenticate(), requireUserType('ADMIN'));

// Internship roles
router.get('/internship-roles', requirePermission('internship_role.view'), RoleController.listInternshipRoles);
router.post('/internship-roles', requirePermission('internship_role.manage'), RoleController.createInternshipRole);
router.patch('/internship-roles/:id', requirePermission('internship_role.manage'), RoleController.updateInternshipRole);

// Batches
router.get('/batches', requirePermission('batch.view'), RoleController.listBatches);
router.post('/batches', requirePermission('batch.manage'), RoleController.createBatch);
router.patch('/batches/:id', requirePermission('batch.manage'), RoleController.updateBatch);
router.delete('/batches/:id', requirePermission('batch.manage'), RoleController.deleteBatch);

export default router;
