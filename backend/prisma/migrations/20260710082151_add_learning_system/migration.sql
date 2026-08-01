-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('ARTICLE', 'VIDEO', 'QUIZ', 'ASSIGNMENT', 'RESOURCE');

-- CreateEnum
CREATE TYPE "PhaseStatus" AS ENUM ('LOCKED', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ModuleProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL,
    "internshipRoleId" TEXT,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningModule" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleContent" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "xpReward" INTEGER NOT NULL DEFAULT 10,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternPhase" (
    "id" TEXT NOT NULL,
    "internId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "status" "PhaseStatus" NOT NULL DEFAULT 'LOCKED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternModuleProgress" (
    "id" TEXT NOT NULL,
    "internId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "status" "ModuleProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternModuleProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternContentProgress" (
    "id" TEXT NOT NULL,
    "internId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternContentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternStreak" (
    "id" TEXT NOT NULL,
    "internId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InternStreak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Phase_internshipRoleId_idx" ON "Phase"("internshipRoleId");

-- CreateIndex
CREATE INDEX "Phase_order_idx" ON "Phase"("order");

-- CreateIndex
CREATE INDEX "LearningModule_phaseId_idx" ON "LearningModule"("phaseId");

-- CreateIndex
CREATE INDEX "LearningModule_order_idx" ON "LearningModule"("order");

-- CreateIndex
CREATE INDEX "ModuleContent_moduleId_idx" ON "ModuleContent"("moduleId");

-- CreateIndex
CREATE INDEX "ModuleContent_type_idx" ON "ModuleContent"("type");

-- CreateIndex
CREATE INDEX "ModuleContent_order_idx" ON "ModuleContent"("order");

-- CreateIndex
CREATE INDEX "InternPhase_internId_idx" ON "InternPhase"("internId");

-- CreateIndex
CREATE INDEX "InternPhase_status_idx" ON "InternPhase"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InternPhase_internId_phaseId_key" ON "InternPhase"("internId", "phaseId");

-- CreateIndex
CREATE INDEX "InternModuleProgress_internId_idx" ON "InternModuleProgress"("internId");

-- CreateIndex
CREATE INDEX "InternModuleProgress_status_idx" ON "InternModuleProgress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InternModuleProgress_internId_moduleId_key" ON "InternModuleProgress"("internId", "moduleId");

-- CreateIndex
CREATE INDEX "InternContentProgress_internId_idx" ON "InternContentProgress"("internId");

-- CreateIndex
CREATE UNIQUE INDEX "InternContentProgress_internId_contentId_key" ON "InternContentProgress"("internId", "contentId");

-- CreateIndex
CREATE INDEX "InternStreak_internId_idx" ON "InternStreak"("internId");

-- CreateIndex
CREATE UNIQUE INDEX "InternStreak_internId_date_key" ON "InternStreak"("internId", "date");

-- AddForeignKey
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_internshipRoleId_fkey" FOREIGN KEY ("internshipRoleId") REFERENCES "InternshipRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningModule" ADD CONSTRAINT "LearningModule_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleContent" ADD CONSTRAINT "ModuleContent_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "LearningModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternPhase" ADD CONSTRAINT "InternPhase_internId_fkey" FOREIGN KEY ("internId") REFERENCES "Intern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternPhase" ADD CONSTRAINT "InternPhase_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternModuleProgress" ADD CONSTRAINT "InternModuleProgress_internId_fkey" FOREIGN KEY ("internId") REFERENCES "Intern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternModuleProgress" ADD CONSTRAINT "InternModuleProgress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "LearningModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternContentProgress" ADD CONSTRAINT "InternContentProgress_internId_fkey" FOREIGN KEY ("internId") REFERENCES "Intern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternContentProgress" ADD CONSTRAINT "InternContentProgress_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ModuleContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternStreak" ADD CONSTRAINT "InternStreak_internId_fkey" FOREIGN KEY ("internId") REFERENCES "Intern"("id") ON DELETE CASCADE ON UPDATE CASCADE;
