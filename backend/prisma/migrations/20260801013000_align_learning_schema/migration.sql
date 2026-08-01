-- Align the earlier learning prototype with the current portal schema.
-- The prototype tables were never used in production; the live development
-- database already has this target structure from the prior schema push.

-- Remove prototype learning structures in dependency order.
DROP TABLE IF EXISTS "InternContentProgress";
DROP TABLE IF EXISTS "InternModuleProgress";
DROP TABLE IF EXISTS "InternPhase";
DROP TABLE IF EXISTS "ModuleContent";
DROP TABLE IF EXISTS "LearningModule";
DROP TABLE IF EXISTS "Phase";
DROP TABLE IF EXISTS "InternStreak";

DROP TYPE IF EXISTS "ContentType";
DROP TYPE IF EXISTS "ModuleProgressStatus";
DROP TYPE IF EXISTS "PhaseStatus";

CREATE TYPE "PhaseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ModuleStatus" AS ENUM ('LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED');
CREATE TYPE "LiveSessionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TABLE "LearningPhase" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "PhaseStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LearningPhase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LearningModule" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "videoUrl" TEXT,
    "resourceUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 10,
    "status" "PhaseStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LearningModule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ModuleProgress" (
    "id" TEXT NOT NULL,
    "internId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "status" "ModuleStatus" NOT NULL DEFAULT 'LOCKED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "score" INTEGER,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ModuleProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "dueDate" TIMESTAMP(3),
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssignmentSubmission" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "internId" TEXT NOT NULL,
    "submissionUrl" TEXT,
    "submissionText" TEXT,
    "score" INTEGER,
    "feedback" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "InternStreak" (
    "id" TEXT NOT NULL,
    "internId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InternStreak_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DailyActivity" (
    "id" TEXT NOT NULL,
    "internId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "modules" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LiveSession" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "hostName" TEXT NOT NULL,
    "meetingUrl" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "status" "LiveSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "recordingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LiveSessionAttendee" (
    "id" TEXT NOT NULL,
    "liveSessionId" TEXT NOT NULL,
    "internId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LiveSessionAttendee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "internId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TicketMessage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LearningPhase_slug_key" ON "LearningPhase"("slug");
CREATE INDEX "LearningPhase_status_idx" ON "LearningPhase"("status");
CREATE INDEX "LearningModule_phaseId_idx" ON "LearningModule"("phaseId");
CREATE INDEX "LearningModule_status_idx" ON "LearningModule"("status");
CREATE INDEX "ModuleProgress_internId_idx" ON "ModuleProgress"("internId");
CREATE INDEX "ModuleProgress_moduleId_idx" ON "ModuleProgress"("moduleId");
CREATE INDEX "ModuleProgress_status_idx" ON "ModuleProgress"("status");
CREATE UNIQUE INDEX "ModuleProgress_internId_moduleId_key" ON "ModuleProgress"("internId", "moduleId");
CREATE INDEX "Assignment_moduleId_idx" ON "Assignment"("moduleId");
CREATE INDEX "AssignmentSubmission_internId_idx" ON "AssignmentSubmission"("internId");
CREATE INDEX "AssignmentSubmission_assignmentId_idx" ON "AssignmentSubmission"("assignmentId");
CREATE INDEX "AssignmentSubmission_status_idx" ON "AssignmentSubmission"("status");
CREATE UNIQUE INDEX "AssignmentSubmission_assignmentId_internId_key" ON "AssignmentSubmission"("assignmentId", "internId");
CREATE UNIQUE INDEX "InternStreak_internId_key" ON "InternStreak"("internId");
CREATE INDEX "DailyActivity_internId_idx" ON "DailyActivity"("internId");
CREATE INDEX "DailyActivity_date_idx" ON "DailyActivity"("date");
CREATE UNIQUE INDEX "DailyActivity_internId_date_key" ON "DailyActivity"("internId", "date");
CREATE INDEX "LiveSession_status_idx" ON "LiveSession"("status");
CREATE INDEX "LiveSession_scheduledAt_idx" ON "LiveSession"("scheduledAt");
CREATE INDEX "LiveSessionAttendee_internId_idx" ON "LiveSessionAttendee"("internId");
CREATE INDEX "LiveSessionAttendee_liveSessionId_idx" ON "LiveSessionAttendee"("liveSessionId");
CREATE UNIQUE INDEX "LiveSessionAttendee_liveSessionId_internId_key" ON "LiveSessionAttendee"("liveSessionId", "internId");
CREATE INDEX "SupportTicket_internId_idx" ON "SupportTicket"("internId");
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");
CREATE INDEX "SupportTicket_priority_idx" ON "SupportTicket"("priority");
CREATE INDEX "TicketMessage_ticketId_idx" ON "TicketMessage"("ticketId");
ALTER TABLE "LearningModule" ADD CONSTRAINT "LearningModule_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "LearningPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModuleProgress" ADD CONSTRAINT "ModuleProgress_internId_fkey" FOREIGN KEY ("internId") REFERENCES "Intern"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModuleProgress" ADD CONSTRAINT "ModuleProgress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "LearningModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "LearningModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_internId_fkey" FOREIGN KEY ("internId") REFERENCES "Intern"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InternStreak" ADD CONSTRAINT "InternStreak_internId_fkey" FOREIGN KEY ("internId") REFERENCES "Intern"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_internId_fkey" FOREIGN KEY ("internId") REFERENCES "Intern"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveSessionAttendee" ADD CONSTRAINT "LiveSessionAttendee_liveSessionId_fkey" FOREIGN KEY ("liveSessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveSessionAttendee" ADD CONSTRAINT "LiveSessionAttendee_internId_fkey" FOREIGN KEY ("internId") REFERENCES "Intern"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_internId_fkey" FOREIGN KEY ("internId") REFERENCES "Intern"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
