-- AlterTable
ALTER TABLE "CaseStudy" ADD COLUMN "classification" TEXT NOT NULL DEFAULT 'mainstream';
ALTER TABLE "CaseStudy" ADD COLUMN "pitch" TEXT;
ALTER TABLE "CaseStudy" ADD COLUMN "reality" TEXT;
ALTER TABLE "CaseStudy" ADD COLUMN "lessons_learned" TEXT;
ALTER TABLE "CaseStudy" ADD COLUMN "custom_html" TEXT;
