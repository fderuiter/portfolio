-- AlterTable
ALTER TABLE "CaseStudy" ADD COLUMN     "pitch" TEXT,
ADD COLUMN     "implementation_reality" TEXT,
ADD COLUMN     "lessons_learned" TEXT,
ADD COLUMN     "graveyard" BOOLEAN NOT NULL DEFAULT false;
