import { Router } from 'express';
import { authenticate, requireUserType } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/permission.middleware';
import * as RoleController from '@/modules/roles/role.controller';

const router = Router();

router.use(authenticate(), requireUserType('ADMIN'));

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { data: any; expiresAt: number }>();

function withCache(key: string, handler: any) {
  return (req: any, res: any, next: any) => {
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json(cached.data);
    }
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, { data: body, expiresAt: Date.now() + CACHE_TTL_MS });
      }
      return originalJson(body);
    };
    return handler(req, res, next);
  };
}

function invalidateCache(key: string, handler: any) {
  return (req: any, res: any, next: any) => {
    cache.delete(key);
    return handler(req, res, next);
  };
}

// Internship roles
router.get('/internship-roles', requirePermission('internship_role.view'), withCache('internship-roles', RoleController.listInternshipRoles));
router.post('/internship-roles', requirePermission('internship_role.manage'), invalidateCache('internship-roles', RoleController.createInternshipRole));
router.patch('/internship-roles/:id', requirePermission('internship_role.manage'), invalidateCache('internship-roles', RoleController.updateInternshipRole));

// Batches
router.get('/batches', requirePermission('batch.view'), withCache('batches', RoleController.listBatches));
router.post('/batches', requirePermission('batch.manage'), invalidateCache('batches', RoleController.createBatch));
router.patch('/batches/:id', requirePermission('batch.manage'), invalidateCache('batches', RoleController.updateBatch));
router.delete('/batches/:id', requirePermission('batch.manage'), invalidateCache('batches', RoleController.deleteBatch));

export default router;
