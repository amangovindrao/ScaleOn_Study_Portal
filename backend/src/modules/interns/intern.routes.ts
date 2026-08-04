import { Router } from 'express';
import { authenticate, requireUserType } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/permission.middleware';
import { validate } from '@/middleware/validate.middleware';
import * as InternController from './intern.controller';
import * as Schemas from './intern.validation';

const router = Router();

// All intern routes require authentication + admin user type
router.use(authenticate(), requireUserType('ADMIN'));

router.get('/', requirePermission('intern.view'), validate(Schemas.listInternsSchema), InternController.listInterns);
router.post('/', requirePermission('intern.create'), validate(Schemas.createInternSchema), InternController.createIntern);
router.get('/analytics/summary', requirePermission('intern.view'), InternController.getAnalyticsSummary);
router.get('/:id', requirePermission('intern.view'), InternController.getIntern);
router.patch('/:id', requirePermission('intern.update'), validate(Schemas.updateInternSchema), InternController.updateIntern);
router.delete('/:id', requirePermission('intern.delete'), InternController.deleteIntern);
router.post('/:id/suspend', requirePermission('intern.suspend'), validate(Schemas.suspendInternSchema), InternController.suspendIntern);
router.post('/:id/activate', requirePermission('intern.suspend'), InternController.activateIntern);
router.post('/:id/transfer', requirePermission('intern.transfer'), validate(Schemas.transferInternSchema), InternController.transferIntern);
router.post('/:id/extend', requirePermission('intern.extend'), validate(Schemas.extendInternshipSchema), InternController.extendInternship);
router.post('/:id/reset-password', requirePermission('intern.reset_password'), InternController.resetInternPassword);

export default router;
