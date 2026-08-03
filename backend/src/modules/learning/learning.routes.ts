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
router.get('/live-sessions', authenticate(), LC.listLiveSessions);
router.get('/leaderboard', authenticate(), LC.getLeaderboard);
router.get('/support/my-tickets', authenticate(), requireUserType('INTERN'), LC.listMyTickets);
router.post('/support/tickets', authenticate(), requireUserType('INTERN'), LC.createTicket);

// ── Admin routes ───────────────────────────────────────
router.get('/phases', authenticate(), requireUserType('ADMIN'), LC.listPhases);
router.post('/phases', authenticate(), requireUserType('ADMIN'), LC.createPhase);
router.post('/modules', authenticate(), requireUserType('ADMIN'), LC.createModule);
router.patch('/modules/:id', authenticate(), requireUserType('ADMIN'), LC.updateModule);
router.post('/assignments/create', authenticate(), requireUserType('ADMIN'), LC.adminCreateAssignment);
router.post('/live-sessions/create', authenticate(), requireUserType('ADMIN'), LC.adminCreateLiveSession);
router.get('/support/all-tickets', authenticate(), requireUserType('ADMIN'), LC.adminListTickets);
router.get('/analytics', authenticate(), requireUserType('ADMIN'), LC.getAnalytics);

export default router;
