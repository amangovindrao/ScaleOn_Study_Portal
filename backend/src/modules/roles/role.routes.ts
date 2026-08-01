import { Router } from 'express';
import { authenticate, requireUserType } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/permission.middleware';
import * as RoleController from './role.controller';

const router = Router();

// All role routes require admin
router.use(authenticate(), requireUserType('ADMIN'));

// System roles
router.get('/', requirePermission('role.view'), RoleController.listRoles);
router.post('/', requirePermission('role.manage'), RoleController.createRole);
router.get('/:id', requirePermission('role.view'), RoleController.getRole);
router.put('/:id/permissions', requirePermission('role.assign_permissions'), RoleController.updateRolePermissions);

// Permissions catalog
router.get('/permissions/all', requirePermission('role.view'), RoleController.listPermissions);

export default router;
