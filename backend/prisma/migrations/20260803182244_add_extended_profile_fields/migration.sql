-- AlterTable
ALTER TABLE "InternProfile" ADD COLUMN     "achievements" TEXT,
ADD COLUMN     "aiProjects" TEXT,
ADD COLUMN     "codingProfiles" JSONB,
ADD COLUMN     "currentRole" TEXT,
ADD COLUMN     "interestedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "specialization" TEXT;
