import { Router } from 'express';
import { authenticate, requireUserType } from '@/middleware/auth.middleware';
import * as LC from './learning.controller';

const router = Router();

// ── Intern routes ──────────────────────────────────────
router.get('/my-learning', authenticate(), requireUserType('INTERN'), LC.getMyLearning);
router.get('/certificates', authenticate(), requireUserType('INTERN'), LC.getMyCertificates);
router.post('/modules/:moduleId/complete', authenticate(), requireUserType('INTERN'), LC.completeModule);

router.get('/my-streak', authenticate(), requireUserType('INTERN'), LC.getMyStreak);
router.get('/assignments', authenticate(), requireUserType('INTERN'), LC.listAssignments);
router.post('/assignments/:assignmentId/submit', authenticate(), requireUserType('INTERN'), LC.submitAssignment);
router.delete('/assignments/:assignmentId/submit', authenticate(), requireUserType('INTERN'), LC.deleteSubmission);
router.get('/live-sessions', authenticate(), LC.listLiveSessions);
router.get('/leaderboard', authenticate(), LC.getLeaderboard);
router.get('/support/my-tickets', authenticate(), requireUserType('INTERN'), LC.listMyTickets);
router.post('/support/tickets', authenticate(), requireUserType('INTERN'), LC.createTicket);
router.delete('/support/tickets/:ticketId', authenticate(), requireUserType('INTERN'), LC.deleteTicket);
router.post('/support/tickets/:ticketId/messages', authenticate(), requireUserType('INTERN'), LC.replyTicket);
router.patch('/support/tickets/:ticketId/status', authenticate(), requireUserType('INTERN'), LC.updateTicketStatus);

// ── Admin routes ───────────────────────────────────────
router.get('/phases', authenticate(), requireUserType('ADMIN'), LC.listPhases);
router.post('/phases', authenticate(), requireUserType('ADMIN'), LC.createPhase);
router.post('/modules', authenticate(), requireUserType('ADMIN'), LC.createModule);
router.patch('/modules/:id', authenticate(), requireUserType('ADMIN'), LC.updateModule);
router.get('/admin/assignments', authenticate(), requireUserType('ADMIN'), LC.adminListAssignments);
router.get('/admin/assignments/:id', authenticate(), requireUserType('ADMIN'), LC.adminGetAssignmentById);
router.post('/assignments/create', authenticate(), requireUserType('ADMIN'), LC.adminCreateAssignment);
router.patch('/assignments/:id', authenticate(), requireUserType('ADMIN'), LC.adminUpdateAssignment);
router.delete('/assignments/:id', authenticate(), requireUserType('ADMIN'), LC.adminDeleteAssignment);
router.patch('/assignments/submissions/:submissionId/review', authenticate(), requireUserType('ADMIN'), LC.adminReviewSubmission);
router.get('/modules/options', authenticate(), LC.listLearningModules);
router.get('/live-sessions/admin', authenticate(), requireUserType('ADMIN'), LC.adminListLiveSessions);
router.post('/live-sessions/create', authenticate(), requireUserType('ADMIN'), LC.adminCreateLiveSession);
router.get('/support/all-tickets', authenticate(), requireUserType('ADMIN'), LC.adminListTickets);
router.post('/support/tickets/:ticketId/admin-messages', authenticate(), requireUserType('ADMIN'), LC.adminReplyTicket);
router.patch('/support/tickets/:ticketId/admin-status', authenticate(), requireUserType('ADMIN'), LC.adminUpdateTicketStatus);
router.get('/analytics', authenticate(), requireUserType('ADMIN'), LC.getAnalytics);

// Intern of the Week routes
router.get('/intern-of-week', authenticate(), LC.getInternOfWeek);
router.get('/intern-of-week/history', authenticate(), LC.getInternOfWeekHistory);
router.post('/intern-of-week', authenticate(), requireUserType('ADMIN'), LC.adminSetInternOfWeek);
router.delete('/intern-of-week/:id', authenticate(), requireUserType('ADMIN'), LC.adminDeleteInternOfWeek);

export default router;
