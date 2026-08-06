import { Router } from 'express';
import { authenticate, requireUserType } from '@/middleware/auth.middleware';
import { requirePermission } from '@/middleware/permission.middleware';
import { validate } from '@/middleware/validate.middleware';
import * as LC from './learning.controller';
import * as LV from './learning.validation';

const router = Router();

// ── Intern routes ──────────────────────────────────────
router.get('/my-learning', authenticate(), requireUserType('INTERN'), LC.getMyLearning);
router.get('/certificates', authenticate(), requireUserType('INTERN'), LC.getMyCertificates);
router.post('/modules/:moduleId/complete', authenticate(), requireUserType('INTERN'), validate(LV.completeModuleSchema), LC.completeModule);

router.get('/my-streak', authenticate(), requireUserType('INTERN'), LC.getMyStreak);
router.get('/assignments', authenticate(), requireUserType('INTERN'), LC.listAssignments);
router.post('/assignments/:assignmentId/submit', authenticate(), requireUserType('INTERN'), validate(LV.submitAssignmentSchema), LC.submitAssignment);
router.delete('/assignments/:assignmentId/submit', authenticate(), requireUserType('INTERN'), validate(LV.deleteSubmissionSchema), LC.deleteSubmission);
router.get('/live-sessions', authenticate(), LC.listLiveSessions);
router.get('/leaderboard', authenticate(), LC.getLeaderboard);
router.get('/support/my-tickets', authenticate(), requireUserType('INTERN'), LC.listMyTickets);
router.post('/support/tickets', authenticate(), requireUserType('INTERN'), validate(LV.createTicketSchema), LC.createTicket);
router.delete('/support/tickets/:ticketId', authenticate(), requireUserType('INTERN'), validate(LV.deleteTicketSchema), LC.deleteTicket);
router.post('/support/tickets/:ticketId/messages', authenticate(), requireUserType('INTERN'), validate(LV.replyTicketSchema), LC.replyTicket);
router.patch('/support/tickets/:ticketId/status', authenticate(), requireUserType('INTERN'), validate(LV.updateTicketStatusSchema), LC.updateTicketStatus);

// ── Admin routes ───────────────────────────────────────
router.get('/phases', authenticate(), requirePermission('learning.view'), validate(LV.listPhasesSchema), LC.listPhases);
router.post('/phases', authenticate(), requirePermission('learning.manage_phases'), validate(LV.createPhaseSchema), LC.createPhase);
router.post('/modules', authenticate(), requirePermission('learning.manage_modules'), validate(LV.createModuleSchema), LC.createModule);
router.patch('/modules/:id', authenticate(), requirePermission('learning.manage_modules'), validate(LV.updateModuleSchema), LC.updateModule);
router.get('/admin/assignments', authenticate(), requirePermission('learning.manage_assignments'), validate(LV.adminListAssignmentsSchema), LC.adminListAssignments);
router.get('/admin/assignments/:id', authenticate(), requirePermission('learning.manage_assignments'), validate(LV.adminGetAssignmentByIdSchema), LC.adminGetAssignmentById);
router.post('/assignments/create', authenticate(), requirePermission('learning.manage_assignments'), validate(LV.adminCreateAssignmentSchema), LC.adminCreateAssignment);
router.patch('/assignments/:id', authenticate(), requirePermission('learning.manage_assignments'), validate(LV.adminUpdateAssignmentSchema), LC.adminUpdateAssignment);
router.delete('/assignments/:id', authenticate(), requirePermission('learning.manage_assignments'), validate(LV.adminDeleteAssignmentSchema), LC.adminDeleteAssignment);
router.patch('/assignments/submissions/:submissionId/review', authenticate(), requirePermission('learning.review_assignments'), validate(LV.adminReviewSubmissionSchema), LC.adminReviewSubmission);
router.get('/modules/options', authenticate(), LC.listLearningModules);
router.get('/live-sessions/admin', authenticate(), requirePermission('learning.manage_sessions'), validate(LV.adminListLiveSessionsSchema), LC.adminListLiveSessions);
router.post('/live-sessions/create', authenticate(), requirePermission('learning.manage_sessions'), validate(LV.adminCreateLiveSessionSchema), LC.adminCreateLiveSession);
router.get('/support/all-tickets', authenticate(), requirePermission('learning.manage_tickets'), LC.adminListTickets);
router.post('/support/tickets/:ticketId/admin-messages', authenticate(), requirePermission('learning.manage_tickets'), validate(LV.adminReplyTicketSchema), LC.adminReplyTicket);
router.patch('/support/tickets/:ticketId/admin-status', authenticate(), requirePermission('learning.manage_tickets'), validate(LV.adminUpdateTicketStatusSchema), LC.adminUpdateTicketStatus);
router.get('/analytics', authenticate(), requirePermission('learning.view'), LC.getAnalytics);

// Intern of the Week routes
router.get('/intern-of-week', authenticate(), LC.getInternOfWeek);
router.get('/intern-of-week/history', authenticate(), LC.getInternOfWeekHistory);
router.post('/intern-of-week', authenticate(), requirePermission('learning.manage_intern_of_week'), validate(LV.adminSetInternOfWeekSchema), LC.adminSetInternOfWeek);
router.delete('/intern-of-week/:id', authenticate(), requirePermission('learning.manage_intern_of_week'), validate(LV.adminDeleteInternOfWeekSchema), LC.adminDeleteInternOfWeek);

export default router;
